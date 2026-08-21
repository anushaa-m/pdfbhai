def validate_mcq(mcq: dict) -> tuple[bool, list[str]]:
    """
    Validates a raw MCQ dict returned by the AI service.
    Returns (is_valid, list_of_issues).
    """
    issues = []

    required_fields = ["question", "options", "answer", "difficulty", "concept"]
    for field in required_fields:
        if field not in mcq or mcq[field] in (None, ""):
            issues.append(f"Missing or empty field: {field}")

    if issues:
        return False, issues

    options = mcq["options"]
    expected_keys = {"A", "B", "C", "D"}
    if set(options.keys()) != expected_keys:
        issues.append(f"Options must have exactly keys A,B,C,D. Got: {list(options.keys())}")

    option_values = list(options.values())
    if len(set(option_values)) != len(option_values):
        issues.append("Duplicate option text detected")

    if mcq["answer"] not in expected_keys:
        issues.append(f"Answer '{mcq['answer']}' is not one of A/B/C/D")

    if mcq["difficulty"] not in {"easy", "medium", "hard"}:
        issues.append(f"Invalid difficulty: {mcq['difficulty']}")

    if len(mcq["question"].strip()) < 10:
        issues.append("Question text looks too short to be meaningful")

    return len(issues) == 0, issues


def is_duplicate_question(new_question_text: str, existing_question_texts: list[str], threshold: float = 0.9) -> bool:
    """
    Simple duplicate check using normalized string overlap.
    Good enough for a hackathon; swap for embedding-similarity if you have time.
    """
    normalized_new = _normalize(new_question_text)

    for existing in existing_question_texts:
        normalized_existing = _normalize(existing)
        if normalized_new == normalized_existing:
            return True
        overlap = _word_overlap_ratio(normalized_new, normalized_existing)
        if overlap >= threshold:
            return True

    return False


def _normalize(text: str) -> str:
    return " ".join(text.lower().split())


def _word_overlap_ratio(a: str, b: str) -> float:
    words_a = set(a.split())
    words_b = set(b.split())
    if not words_a or not words_b:
        return 0.0
    intersection = words_a & words_b
    union = words_a | words_b
    return len(intersection) / len(union)
