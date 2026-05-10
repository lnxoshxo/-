import json

from flask import jsonify, render_template, request

from .search import get_llm_config, load_default_knowledge_base, load_knowledge_base, normalize_knowledge_base, save_knowledge_base, search_knowledge_base


def register_routes(app):
    @app.get("/")
    def index():
        knowledge_base = normalize_knowledge_base(load_knowledge_base())
        return render_template(
            "index.html",
            sections=knowledge_base.get("sections", []),
            theme=knowledge_base.get("theme", {}),
            branding=knowledge_base.get("branding", {}),
            quick_questions=knowledge_base.get("quick_questions", []),
            idle_slides=knowledge_base.get("idle_slides", []),
            guided_tour=knowledge_base.get("guided_tour", []),
            llm_config=get_llm_config(),
        )

    @app.get("/v2")
    def index_v2():
        knowledge_base = normalize_knowledge_base(load_knowledge_base())
        v2_theme = {
            **knowledge_base.get("theme", {}),
            "company": "上实服务",
        }
        return render_template(
            "index_v2.html",
            sections=knowledge_base.get("sections", []),
            theme=v2_theme,
            branding=knowledge_base.get("branding", {}),
            quick_questions=knowledge_base.get("quick_questions", []),
            guided_tour=knowledge_base.get("guided_tour", []),
            llm_config=get_llm_config(),
        )

    @app.get("/v2-1")
    def index_v2_1():
        knowledge_base = normalize_knowledge_base(load_knowledge_base())
        v2_theme = {
            **knowledge_base.get("theme", {}),
            "company": "上实服务",
        }
        return render_template(
            "index_v2_1.html",
            sections=knowledge_base.get("sections", []),
            theme=v2_theme,
            branding=knowledge_base.get("branding", {}),
            quick_questions=knowledge_base.get("quick_questions", []),
            guided_tour=knowledge_base.get("guided_tour", []),
            llm_config=get_llm_config(),
        )

    @app.get("/v2-2")
    def index_v2_2():
        knowledge_base = normalize_knowledge_base(load_knowledge_base())
        v2_theme = {
            **knowledge_base.get("theme", {}),
            "company": "上实服务",
        }
        return render_template(
            "index_v2_2.html",
            sections=knowledge_base.get("sections", []),
            theme=v2_theme,
            branding=knowledge_base.get("branding", {}),
            quick_questions=knowledge_base.get("quick_questions", []),
            guided_tour=knowledge_base.get("guided_tour", []),
            llm_config=get_llm_config(),
        )

    @app.get("/v2-3")
    def index_v2_3():
        knowledge_base = normalize_knowledge_base(load_knowledge_base())
        v2_theme = {
            **knowledge_base.get("theme", {}),
            "company": "上实服务",
        }
        return render_template(
            "index_v2_3.html",
            sections=knowledge_base.get("sections", []),
            theme=v2_theme,
            branding=knowledge_base.get("branding", {}),
            quick_questions=knowledge_base.get("quick_questions", []),
            guided_tour=knowledge_base.get("guided_tour", []),
            llm_config=get_llm_config(),
        )

    @app.get("/v2-4")
    def index_v2_4():
        knowledge_base = normalize_knowledge_base(load_knowledge_base())
        v2_theme = {
            **knowledge_base.get("theme", {}),
            "company": "上实服务",
        }
        return render_template(
            "index_v2_4.html",
            sections=knowledge_base.get("sections", []),
            theme=v2_theme,
            branding=knowledge_base.get("branding", {}),
            quick_questions=knowledge_base.get("quick_questions", []),
            guided_tour=knowledge_base.get("guided_tour", []),
            llm_config=get_llm_config(),
        )

    @app.get("/admin")
    def admin():
        knowledge_base = normalize_knowledge_base(load_knowledge_base())
        return render_template(
            "admin.html",
            knowledge_base=json.dumps(knowledge_base, ensure_ascii=False, indent=2),
            llm_config=get_llm_config(),
        )

    @app.get("/api/sections")
    def sections():
        return jsonify(normalize_knowledge_base(load_knowledge_base()))

    @app.post("/api/knowledge-base")
    def update_knowledge_base():
        payload = request.get_json(silent=True)
        if not isinstance(payload, dict):
            return jsonify({"error": "请提交合法的 JSON 知识库对象。"}), 400

        normalized = normalize_knowledge_base(payload)
        if not normalized.get("sections") or not normalized.get("entries"):
            return jsonify({"error": "知识库至少需要包含 `sections` 和 `entries` 内容。"}), 400

        save_knowledge_base(normalized)
        return jsonify({"message": "知识库已更新。", "knowledge_base": normalized})

    @app.post("/api/knowledge-base/reset")
    def reset_knowledge_base():
        default_payload = normalize_knowledge_base(load_default_knowledge_base())
        save_knowledge_base(default_payload)
        return jsonify({"message": "已恢复默认演示数据。", "knowledge_base": default_payload})

    @app.post("/api/ask")
    def ask():
        payload = request.get_json(silent=True) or {}
        question = (payload.get("question") or "").strip()
        if not question:
            return jsonify({"error": "请输入问题后再进行查询。"}), 400
        return jsonify(search_knowledge_base(question))
