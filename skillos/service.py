import json
import uuid
from datetime import datetime, timedelta
from typing import Any

from skillos.db import row_to_dict


def _instance_no() -> str:
    return f"INS-{uuid.uuid4().hex[:12]}"


def _task_no() -> str:
    return f"TSK-{uuid.uuid4().hex[:12]}"


def _deliverable_no() -> str:
    return f"DLV-{uuid.uuid4().hex[:12]}"


def _risk_key(instance_id: int, task_no: str) -> str:
    return f"OVERDUE:{instance_id}:{task_no}"


def _deadline_from_node(node: dict[str, Any]) -> str | None:
    now = datetime.utcnow()
    if "slaMinutes" in node:
        return (now + timedelta(minutes=int(node["slaMinutes"]))).strftime("%Y-%m-%d %H:%M:%S")
    if "slaHours" in node:
        return (now + timedelta(hours=int(node["slaHours"]))).strftime("%Y-%m-%d %H:%M:%S")
    return None


def _log_activity(conn, instance_id: int | None, task_id: int | None, activity_type: str, message: str) -> None:
    conn.execute(
        "insert into activity_log (instance_id, task_id, activity_type, message) values (?, ?, ?, ?)",
        (instance_id, task_id, activity_type, message),
    )


def _refresh_instance_status(conn, instance_id: int) -> None:
    task_rows = conn.execute("select status from task_item where instance_id=?", (instance_id,)).fetchall()
    open_risks = conn.execute(
        "select count(*) as c from risk_issue where instance_id=? and status='open'", (instance_id,)
    ).fetchone()["c"]
    if task_rows and all(r["status"] == "done" for r in task_rows):
        status = "done_with_risk" if open_risks > 0 else "done"
        conn.execute(
            "update skill_instance set status=?, end_at=datetime('now') where id=?",
            (status, instance_id),
        )
    else:
        status = "running_with_risk" if open_risks > 0 else "running"
        conn.execute("update skill_instance set status=? where id=?", (status, instance_id))


def _require_fields(data: dict[str, Any], fields: list[str]) -> None:
    missing = [f for f in fields if f not in data]
    if missing:
        raise ValueError(f"missing required fields: {', '.join(missing)}")


def list_skills(conn, domain_no: int | None = None) -> list[dict[str, Any]]:
    if domain_no is None:
        rows = conn.execute("select * from skill_definition order by skill_code").fetchall()
    else:
        rows = conn.execute(
            "select * from skill_definition where domain_no = ? order by skill_code", (domain_no,)
        ).fetchall()
    return [row_to_dict(r) for r in rows]


def create_skill(conn, payload: dict[str, Any]) -> dict[str, Any]:
    _require_fields(payload, ["skillCode", "skillName", "domainNo", "moduleNo"])
    conn.execute(
        """
        insert into skill_definition (
          skill_code, skill_name, domain_no, module_no, goal,
          input_schema, output_schema, kpi_schema, risk_schema
        ) values (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            payload["skillCode"],
            payload["skillName"],
            payload["domainNo"],
            payload["moduleNo"],
            payload.get("goal"),
            json.dumps(payload.get("inputSchema", {}), ensure_ascii=False),
            json.dumps(payload.get("outputSchema", {}), ensure_ascii=False),
            json.dumps(payload.get("kpiSchema", {}), ensure_ascii=False),
            json.dumps(payload.get("riskSchema", {}), ensure_ascii=False),
        ),
    )
    conn.commit()
    row = conn.execute(
        "select * from skill_definition where skill_code = ?", (payload["skillCode"],)
    ).fetchone()
    return row_to_dict(row)


def get_skill(conn, skill_code: str) -> dict[str, Any] | None:
    row = conn.execute("select * from skill_definition where skill_code = ?", (skill_code,)).fetchone()
    return row_to_dict(row) if row else None


def upsert_flow(conn, payload: dict[str, Any]) -> dict[str, Any]:
    _require_fields(payload, ["flowCode", "flowName", "skillCode", "flowJson"])
    conn.execute(
        """
        insert into flow_definition (
          flow_code, flow_name, skill_code, flow_json, sla_policy, escalation_policy
        ) values (?, ?, ?, ?, ?, ?)
        on conflict(flow_code) do update set
          flow_name=excluded.flow_name,
          skill_code=excluded.skill_code,
          flow_json=excluded.flow_json,
          sla_policy=excluded.sla_policy,
          escalation_policy=excluded.escalation_policy,
          version=flow_definition.version+1
        """,
        (
            payload["flowCode"],
            payload["flowName"],
            payload["skillCode"],
            json.dumps(payload["flowJson"], ensure_ascii=False),
            json.dumps(payload.get("slaPolicy", {}), ensure_ascii=False),
            json.dumps(payload.get("escalationPolicy", {}), ensure_ascii=False),
        ),
    )
    conn.commit()
    row = conn.execute("select * from flow_definition where flow_code=?", (payload["flowCode"],)).fetchone()
    return row_to_dict(row)


def start_instance(conn, payload: dict[str, Any]) -> dict[str, Any]:
    _require_fields(payload, ["skillCode", "flowCode", "orgId"])
    skill = get_skill(conn, payload["skillCode"])
    if not skill:
        raise ValueError("skill not found")

    flow_row = conn.execute(
        "select * from flow_definition where flow_code=?", (payload["flowCode"],)
    ).fetchone()
    if not flow_row:
        raise ValueError("flow not found")
    flow = row_to_dict(flow_row)

    instance_no = _instance_no()
    conn.execute(
        """
        insert into skill_instance (
          instance_no, skill_code, flow_code, org_id, trigger_source, status, owner_user_id, due_at, extra
        ) values (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            instance_no,
            payload["skillCode"],
            payload["flowCode"],
            payload["orgId"],
            payload.get("triggerSource"),
            "running",
            payload.get("ownerUserId"),
            payload.get("dueAt"),
            json.dumps(payload.get("extra", {}), ensure_ascii=False),
        ),
    )
    instance_id = conn.execute("select id from skill_instance where instance_no=?", (instance_no,)).fetchone()["id"]
    _log_activity(conn, instance_id, None, "instance_started", f"Instance started: {instance_no}")

    nodes = flow.get("flow_json", {}).get("nodes", [])
    for node in nodes:
        if node.get("type") in {"task", "approval"}:
            deadline = _deadline_from_node(node)
            task_no = _task_no()
            conn.execute(
                """
                insert into task_item (task_no, instance_id, node_key, task_name, status, deadline)
                values (?, ?, ?, ?, ?, ?)
                """,
                (
                    task_no,
                    instance_id,
                    node.get("key", "unknown"),
                    node.get("key", "task"),
                    "todo",
                    deadline,
                ),
            )
            task_id = conn.execute("select last_insert_rowid() as id").fetchone()["id"]
            _log_activity(conn, instance_id, task_id, "task_created", f"Task created: {task_no}")

    conn.commit()
    return get_instance(conn, instance_no)


def list_instances(conn) -> list[dict[str, Any]]:
    rows = conn.execute("select * from skill_instance order by id desc").fetchall()
    return [row_to_dict(r) for r in rows]


def list_instances_filtered(conn, status: str | None = None, skill_code: str | None = None) -> list[dict[str, Any]]:
    sql = "select * from skill_instance where 1=1"
    args: list[Any] = []
    if status:
        sql += " and status=?"
        args.append(status)
    if skill_code:
        sql += " and skill_code=?"
        args.append(skill_code)
    sql += " order by id desc"
    rows = conn.execute(sql, tuple(args)).fetchall()
    return [row_to_dict(r) for r in rows]


def get_instance(conn, instance_no: str) -> dict[str, Any] | None:
    row = conn.execute("select * from skill_instance where instance_no=?", (instance_no,)).fetchone()
    if not row:
        return None
    instance = row_to_dict(row)
    tasks = conn.execute(
        "select task_no, node_key, task_name, status, comments from task_item where instance_id=? order by id",
        (row["id"],),
    ).fetchall()
    instance["tasks"] = [dict(t) for t in tasks]
    return instance


def complete_task(conn, task_no: str, comments: str | None = None) -> dict[str, Any]:
    row = conn.execute("select * from task_item where task_no=?", (task_no,)).fetchone()
    if not row:
        raise ValueError("task not found")
    conn.execute(
        "update task_item set status='done', finished_at=datetime('now'), comments=? where task_no=?",
        (comments, task_no),
    )
    if comments:
        conn.execute(
            "insert into task_comment (task_id, comment_text) values (?, ?)",
            (row["id"], comments),
        )
    _log_activity(conn, row["instance_id"], row["id"], "task_completed", f"Task completed: {task_no}")
    _refresh_instance_status(conn, row["instance_id"])
    conn.commit()
    result = conn.execute("select * from task_item where task_no=?", (task_no,)).fetchone()
    return dict(result)


def add_task_comment(conn, task_no: str, comment_text: str) -> dict[str, Any]:
    row = conn.execute("select * from task_item where task_no=?", (task_no,)).fetchone()
    if not row:
        raise ValueError("task not found")
    conn.execute(
        "insert into task_comment (task_id, comment_text) values (?, ?)",
        (row["id"], comment_text),
    )
    _log_activity(conn, row["instance_id"], row["id"], "task_comment", f"Task comment added: {task_no}")
    conn.commit()
    last = conn.execute("select * from task_comment order by id desc limit 1").fetchone()
    return dict(last)


def get_task_detail(conn, task_no: str) -> dict[str, Any] | None:
    row = conn.execute("select * from task_item where task_no=?", (task_no,)).fetchone()
    if not row:
        return None
    result = dict(row)
    comments = conn.execute(
        "select id, comment_text, created_at from task_comment where task_id=? order by id asc",
        (row["id"],),
    ).fetchall()
    result["timeline"] = [dict(c) for c in comments]
    return result


def create_deliverable(conn, payload: dict[str, Any]) -> dict[str, Any]:
    _require_fields(payload, ["instanceNo", "templateCode"])
    instance = conn.execute(
        "select id from skill_instance where instance_no=?", (payload["instanceNo"],)
    ).fetchone()
    if not instance:
        raise ValueError("instance not found")

    deliverable_no = _deliverable_no()
    conn.execute(
        """
        insert into deliverable (deliverable_no, instance_id, template_code, file_uri, file_name)
        values (?, ?, ?, ?, ?)
        """,
        (
            deliverable_no,
            instance["id"],
            payload["templateCode"],
            payload.get("fileUri"),
            payload.get("fileName"),
        ),
    )
    _log_activity(conn, instance["id"], None, "deliverable_created", f"Deliverable created: {payload['templateCode']}")
    conn.commit()
    row = conn.execute("select * from deliverable where deliverable_no=?", (deliverable_no,)).fetchone()
    return dict(row)


def create_risk(conn, payload: dict[str, Any]) -> dict[str, Any]:
    _require_fields(payload, ["instanceNo", "riskLevel", "riskDesc"])
    instance = conn.execute(
        "select id from skill_instance where instance_no=?", (payload["instanceNo"],)
    ).fetchone()
    if not instance:
        raise ValueError("instance not found")
    conn.execute(
        """
        insert into risk_issue (instance_id, risk_level, risk_desc, mitigation, owner_user_id)
        values (?, ?, ?, ?, ?)
        """,
        (
            instance["id"],
            payload["riskLevel"],
            payload["riskDesc"],
            payload.get("mitigation"),
            payload.get("ownerUserId"),
        ),
    )
    _log_activity(conn, instance["id"], None, "risk_created", f"Risk created: {payload['riskDesc']}")
    _refresh_instance_status(conn, instance["id"])
    conn.commit()
    row = conn.execute("select * from risk_issue order by id desc limit 1").fetchone()
    return dict(row)


def list_risks(conn, status: str | None = None) -> list[dict[str, Any]]:
    if status:
        rows = conn.execute("select * from risk_issue where status=? order by id desc", (status,)).fetchall()
    else:
        rows = conn.execute("select * from risk_issue order by id desc").fetchall()
    return [dict(r) for r in rows]


def close_risk(conn, risk_id: int) -> dict[str, Any]:
    row = conn.execute("select * from risk_issue where id=?", (risk_id,)).fetchone()
    if not row:
        raise ValueError("risk not found")
    conn.execute(
        "update risk_issue set status='closed', closed_at=datetime('now') where id=?",
        (risk_id,),
    )
    _log_activity(conn, row["instance_id"], None, "risk_closed", f"Risk closed: {risk_id}")
    _refresh_instance_status(conn, row["instance_id"])
    conn.commit()
    latest = conn.execute("select * from risk_issue where id=?", (risk_id,)).fetchone()
    return dict(latest)


def list_kpis(conn, period_key: str | None = None) -> list[dict[str, Any]]:
    if period_key:
        rows = conn.execute("select * from kpi_record where period_key=?", (period_key,)).fetchall()
    else:
        rows = conn.execute("select * from kpi_record order by id desc").fetchall()
    return [dict(r) for r in rows]


def upsert_kpi(conn, payload: dict[str, Any]) -> dict[str, Any]:
    _require_fields(payload, ["periodKey", "orgId", "skillCode", "kpiCode"])
    conn.execute(
        """
        insert into kpi_record (period_key, org_id, skill_code, kpi_code, target_value, actual_value, source)
        values (?, ?, ?, ?, ?, ?, ?)
        on conflict(period_key, org_id, skill_code, kpi_code) do update set
          target_value=excluded.target_value,
          actual_value=excluded.actual_value,
          source=excluded.source
        """,
        (
            payload["periodKey"],
            payload["orgId"],
            payload["skillCode"],
            payload["kpiCode"],
            payload.get("targetValue"),
            payload.get("actualValue"),
            payload.get("source"),
        ),
    )
    conn.commit()
    row = conn.execute(
        """
        select * from kpi_record
        where period_key=? and org_id=? and skill_code=? and kpi_code=?
        """,
        (payload["periodKey"], payload["orgId"], payload["skillCode"], payload["kpiCode"]),
    ).fetchone()
    return dict(row)


def list_kpis_filtered(conn, period_key: str | None = None, org_id: int | None = None) -> list[dict[str, Any]]:
    sql = "select * from kpi_record where 1=1"
    args: list[Any] = []
    if period_key:
        sql += " and period_key=?"
        args.append(period_key)
    if org_id is not None:
        sql += " and org_id=?"
        args.append(org_id)
    sql += " order by id desc"
    rows = conn.execute(sql, tuple(args)).fetchall()
    return [dict(r) for r in rows]


def list_tasks(conn, status: str | None = None) -> list[dict[str, Any]]:
    if status:
        rows = conn.execute(
            "select * from task_item where status=? order by id desc", (status,)
        ).fetchall()
    else:
        rows = conn.execute("select * from task_item order by id desc").fetchall()
    return [dict(r) for r in rows]


def list_deliverables_by_instance(conn, instance_no: str) -> list[dict[str, Any]]:
    row = conn.execute("select id from skill_instance where instance_no=?", (instance_no,)).fetchone()
    if not row:
        raise ValueError("instance not found")
    rows = conn.execute(
        "select * from deliverable where instance_id=? order by id desc", (row["id"],)
    ).fetchall()
    return [dict(r) for r in rows]


def export_quarterly_summary(conn, period_key: str, org_id: int | None = None) -> dict[str, Any]:
    _require_fields({"periodKey": period_key}, ["periodKey"])
    kpis = list_kpis_filtered(conn, period_key=period_key, org_id=org_id)
    instances = list_instances(conn)
    tasks = list_tasks(conn)
    todo_count = sum(1 for t in tasks if t["status"] != "done")
    done_count = sum(1 for t in tasks if t["status"] == "done")
    return {
        "periodKey": period_key,
        "orgId": org_id,
        "summary": {
            "kpiCount": len(kpis),
            "instanceCount": len(instances),
            "taskDoneCount": done_count,
            "taskTodoCount": todo_count,
        },
        "kpis": kpis,
    }


def dashboard_summary(conn) -> dict[str, Any]:
    instances = list_instances(conn)
    tasks = list_tasks(conn)
    risks = list_risks(conn)
    open_risks = [r for r in risks if r["status"] == "open"]
    status_counts: dict[str, int] = {}
    for ins in instances:
        status_counts[ins["status"]] = status_counts.get(ins["status"], 0) + 1
    return {
        "instanceCount": len(instances),
        "taskCount": len(tasks),
        "taskDoneCount": sum(1 for t in tasks if t["status"] == "done"),
        "riskOpenCount": len(open_risks),
        "instanceStatusCounts": status_counts,
    }


def list_recent_activities(conn, limit: int = 20) -> list[dict[str, Any]]:
    rows = conn.execute("select * from activity_log order by id desc limit ?", (limit,)).fetchall()
    return [dict(r) for r in rows]


def search_all(conn, query: str, limit: int = 20) -> dict[str, list[dict[str, Any]]]:
    q = f"%{query.strip()}%"
    if not query.strip():
        return {"instances": [], "tasks": [], "risks": [], "skills": [], "deliverables": []}
    skills = conn.execute(
        """
        select skill_code, skill_name, domain_no, module_no, status
        from skill_definition
        where skill_code like ? or skill_name like ? or goal like ?
        order by skill_code limit ?
        """,
        (q, q, q, limit),
    ).fetchall()
    instances = conn.execute(
        """
        select instance_no, skill_code, flow_code, org_id, status, start_at, end_at
        from skill_instance
        where instance_no like ? or skill_code like ? or flow_code like ? or status like ?
        order by id desc limit ?
        """,
        (q, q, q, q, limit),
    ).fetchall()
    tasks = conn.execute(
        """
        select task_no, instance_id, node_key, task_name, status, deadline
        from task_item
        where task_no like ? or node_key like ? or task_name like ? or status like ?
        order by id desc limit ?
        """,
        (q, q, q, q, limit),
    ).fetchall()
    risks = conn.execute(
        """
        select id, instance_id, risk_level, risk_desc, status, closed_at
        from risk_issue
        where risk_level like ? or risk_desc like ? or status like ?
        order by id desc limit ?
        """,
        (q, q, q, limit),
    ).fetchall()
    deliverables = conn.execute(
        """
        select deliverable_no, instance_id, template_code, file_uri, file_name, created_at
        from deliverable
        where deliverable_no like ? or template_code like ? or file_uri like ? or file_name like ?
        order by id desc limit ?
        """,
        (q, q, q, q, limit),
    ).fetchall()
    return {
        "skills": [dict(r) for r in skills],
        "instances": [dict(r) for r in instances],
        "tasks": [dict(r) for r in tasks],
        "risks": [dict(r) for r in risks],
        "deliverables": [dict(r) for r in deliverables],
    }


def export_quarterly_csv(conn, period_key: str, org_id: int | None = None) -> str:
    kpis = list_kpis_filtered(conn, period_key=period_key, org_id=org_id)
    lines = ["period_key,org_id,skill_code,kpi_code,target_value,actual_value,source"]
    for k in kpis:
        lines.append(
            ",".join(
                [
                    str(k.get("period_key", "")),
                    str(k.get("org_id", "")),
                    str(k.get("skill_code", "")),
                    str(k.get("kpi_code", "")),
                    str(k.get("target_value", "")),
                    str(k.get("actual_value", "")),
                    str(k.get("source", "") or ""),
                ]
            )
        )
    return "\n".join(lines)


def scan_overdue_tasks(conn) -> list[dict[str, Any]]:
    rows = conn.execute(
        """
        select * from task_item
        where status != 'done'
          and deadline is not null
          and datetime(deadline) < datetime('now')
        order by deadline asc
        """
    ).fetchall()
    return [dict(r) for r in rows]


def escalate_overdue_tasks(conn) -> list[dict[str, Any]]:
    overdue = scan_overdue_tasks(conn)
    created = []
    for task in overdue:
        key = _risk_key(task["instance_id"], task["task_no"])
        exists = conn.execute(
            "select id from risk_issue where mitigation=? and status='open'", (key,)
        ).fetchone()
        if exists:
            continue
        conn.execute(
            """
            insert into risk_issue (instance_id, risk_level, risk_desc, mitigation, status)
            values (?, ?, ?, ?, 'open')
            """,
            (
                task["instance_id"],
                "high",
                f"Task overdue: {task['task_no']} / {task['node_key']}",
                key,
            ),
        )
        _log_activity(conn, task["instance_id"], None, "risk_escalated", f"Overdue escalated: {task['task_no']}")
        _refresh_instance_status(conn, task["instance_id"])
        row = conn.execute("select * from risk_issue order by id desc limit 1").fetchone()
        created.append(dict(row))
    conn.commit()
    return created
