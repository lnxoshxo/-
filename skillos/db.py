import json
import sqlite3
from pathlib import Path
from typing import Any


DEFAULT_DB_PATH = Path("/workspace/skillos.db")


SCHEMA_SQL = """
create table if not exists skill_definition (
  id integer primary key autoincrement,
  skill_code text not null unique,
  skill_name text not null,
  domain_no integer not null,
  module_no integer not null,
  goal text,
  input_schema text not null default '{}',
  output_schema text not null default '{}',
  kpi_schema text not null default '{}',
  risk_schema text not null default '{}',
  status text not null default 'active',
  version integer not null default 1,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create table if not exists flow_definition (
  id integer primary key autoincrement,
  flow_code text not null unique,
  flow_name text not null,
  skill_code text not null,
  flow_json text not null,
  sla_policy text not null default '{}',
  escalation_policy text not null default '{}',
  status text not null default 'active',
  version integer not null default 1,
  created_at text not null default (datetime('now')),
  foreign key(skill_code) references skill_definition(skill_code)
);

create table if not exists skill_instance (
  id integer primary key autoincrement,
  instance_no text not null unique,
  skill_code text not null,
  flow_code text not null,
  org_id integer not null,
  trigger_source text,
  status text not null,
  owner_user_id integer,
  start_at text not null default (datetime('now')),
  due_at text,
  end_at text,
  extra text not null default '{}',
  foreign key(skill_code) references skill_definition(skill_code),
  foreign key(flow_code) references flow_definition(flow_code)
);

create table if not exists task_item (
  id integer primary key autoincrement,
  task_no text not null unique,
  instance_id integer not null,
  node_key text not null,
  task_name text not null,
  assignee_user_id integer,
  priority text not null default 'medium',
  status text not null default 'todo',
  deadline text,
  started_at text,
  finished_at text,
  comments text,
  foreign key(instance_id) references skill_instance(id)
);

create table if not exists task_comment (
  id integer primary key autoincrement,
  task_id integer not null,
  comment_text text not null,
  created_at text not null default (datetime('now')),
  foreign key(task_id) references task_item(id)
);

create table if not exists deliverable (
  id integer primary key autoincrement,
  deliverable_no text not null unique,
  instance_id integer not null,
  template_code text not null,
  file_uri text,
  file_name text,
  version integer not null default 1,
  approved_by integer,
  approved_at text,
  created_at text not null default (datetime('now')),
  foreign key(instance_id) references skill_instance(id)
);

create table if not exists risk_issue (
  id integer primary key autoincrement,
  instance_id integer not null,
  risk_level text not null,
  risk_desc text not null,
  mitigation text,
  owner_user_id integer,
  status text not null default 'open',
  due_at text,
  closed_at text,
  foreign key(instance_id) references skill_instance(id)
);

create table if not exists kpi_record (
  id integer primary key autoincrement,
  period_key text not null,
  org_id integer not null,
  skill_code text not null,
  kpi_code text not null,
  target_value real,
  actual_value real,
  source text,
  created_at text not null default (datetime('now')),
  unique(period_key, org_id, skill_code, kpi_code),
  foreign key(skill_code) references skill_definition(skill_code)
);

create table if not exists activity_log (
  id integer primary key autoincrement,
  instance_id integer,
  task_id integer,
  activity_type text not null,
  message text not null,
  created_at text not null default (datetime('now')),
  foreign key(instance_id) references skill_instance(id),
  foreign key(task_id) references task_item(id)
);
"""


def connect(db_path: Path = DEFAULT_DB_PATH) -> sqlite3.Connection:
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    return conn


def init_db(conn: sqlite3.Connection) -> None:
    conn.executescript(SCHEMA_SQL)
    conn.commit()


def row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    result = dict(row)
    for key in ("input_schema", "output_schema", "kpi_schema", "risk_schema", "flow_json", "sla_policy", "escalation_policy", "extra"):
        if key in result and isinstance(result[key], str):
            try:
                result[key] = json.loads(result[key])
            except json.JSONDecodeError:
                pass
    return result
