import json
import math
import os
import re
from collections import Counter
from pathlib import Path


WORD_RE = re.compile(r"[\w\u4e00-\u9fff]+")
DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "knowledge_base.json"
DEFAULT_DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "knowledge_base.default.json"


def tokenize(text: str) -> list[str]:
    return [token.lower() for token in WORD_RE.findall(text)]


def build_char_ngrams(text: str, size: int = 2) -> list[str]:
    normalized = re.sub(r"\s+", "", text.lower())
    if len(normalized) < size:
        return [normalized] if normalized else []
    return [normalized[index : index + size] for index in range(len(normalized) - size + 1)]


def cosine_similarity(left: Counter, right: Counter) -> float:
    shared_words = set(left) & set(right)
    numerator = sum(left[word] * right[word] for word in shared_words)
    left_norm = math.sqrt(sum(value * value for value in left.values()))
    right_norm = math.sqrt(sum(value * value for value in right.values()))
    if not left_norm or not right_norm:
        return 0.0
    return numerator / (left_norm * right_norm)


def load_knowledge_base() -> dict:
    with DATA_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def load_default_knowledge_base() -> dict:
    with DEFAULT_DATA_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def save_knowledge_base(payload: dict) -> dict:
    DATA_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return payload


def get_llm_config() -> dict:
    enabled = bool(os.getenv("LLM_API_URL"))
    return {
        "enabled": enabled,
        "provider": os.getenv("LLM_PROVIDER", "reserved"),
        "mode": "knowledge-grounded" if enabled else "keyword-search",
    }


def normalize_knowledge_base(payload: dict) -> dict:
    theme = payload.get("theme", {})
    branding = payload.get("branding", {})
    sections = payload.get("sections", [])
    entries = payload.get("entries", [])
    idle_slides = payload.get("idle_slides", [])
    quick_questions = payload.get("quick_questions", [])
    guided_tour = payload.get("guided_tour", [])

    return {
        "theme": {
            "company": theme.get("company", "上实服务物业集团"),
            "slogan": theme.get("slogan", "智慧服务链接未来社区"),
            "booth_title": theme.get("booth_title", "物业展会智慧交互系统"),
        },
        "branding": {
            "logo_type": branding.get("logo_type", "text"),
            "logo_text": branding.get("logo_text", "SIICservice"),
            "logo_image": branding.get("logo_image", ""),
            "hero_badge": branding.get("hero_badge", "未来物业服务体验站"),
        },
        "quick_questions": quick_questions,
        "idle_slides": idle_slides,
        "guided_tour": guided_tour,
        "sections": sections,
        "entries": entries,
    }


def build_entry_text(entry: dict) -> str:
    segments = [
        entry.get("title", ""),
        entry.get("summary", ""),
        entry.get("answer", ""),
        " ".join(entry.get("keywords", [])),
        " ".join(entry.get("highlights", [])),
        " ".join(case.get("name", "") + " " + case.get("description", "") for case in entry.get("cases", [])),
    ]
    return " ".join(part for part in segments if part)


def score_entry(question: str, entry: dict) -> float:
    question_vector = Counter(tokenize(question))
    question_ngram_vector = Counter(build_char_ngrams(question))
    question_text = question.lower()
    entry_text = build_entry_text(entry)

    keyword_bonus = sum(1 for keyword in entry.get("keywords", []) if keyword.lower() in question_text)
    title_bonus = 0.18 if entry.get("title", "").lower() in question_text else 0
    token_score = cosine_similarity(question_vector, Counter(tokenize(entry_text)))
    ngram_score = cosine_similarity(question_ngram_vector, Counter(build_char_ngrams(entry_text)))
    return token_score * 0.2 + ngram_score * 0.8 + keyword_bonus * 0.08 + title_bonus


def build_answer(best_entry: dict) -> str:
    answer_parts = [best_entry.get("answer") or best_entry.get("summary", "")]
    highlights = best_entry.get("highlights", [])
    if highlights:
        answer_parts.append("重点包括：" + "；".join(highlights[:3]) + "。")
    cases = best_entry.get("cases", [])
    if cases:
        answer_parts.append("代表案例：" + "；".join(case["name"] for case in cases[:2]) + "。")
    return "".join(answer_parts)


def search_knowledge_base(question: str) -> dict:
    knowledge_base = normalize_knowledge_base(load_knowledge_base())
    entries = knowledge_base.get("entries", [])

    scored_entries = []
    for entry in entries:
        score = score_entry(question, entry)
        scored_entries.append((score, entry))

    scored_entries.sort(key=lambda item: item[0], reverse=True)
    top_score, best_entry = scored_entries[0] if scored_entries else (0.0, None)

    if not best_entry or top_score <= 0:
        return {
            "answer": "我已收到您的问题，但当前知识库中没有足够匹配的信息。您可以尝试询问集团概况、服务项目、科技创新、成功案例或未来规划。",
            "match": None,
            "score": 0,
            "related": [],
        }

    related = [
        {
            "title": entry["title"],
            "summary": entry.get("summary", ""),
        }
        for _, entry in scored_entries[1:4]
    ]

    highlights = best_entry.get("highlights", [])
    cases = best_entry.get("cases", [])

    return {
        "answer": build_answer(best_entry),
        "match": {
            "title": best_entry["title"],
            "summary": best_entry.get("summary", ""),
            "answer": best_entry.get("answer", ""),
            "highlights": highlights,
            "cases": cases,
            "media": best_entry.get("media", []),
        },
        "score": round(top_score, 4),
        "related": related,
        "llm": get_llm_config(),
    }
