import json
import logging
import os
import threading
from typing import Any
import random

logger = logging.getLogger(__name__)

PROMPT_TEMPLATE = """You are an expert educational MCQ generator.

Your task is to create EXACTLY ONE high-quality multiple-choice question
using ONLY the study material provided below.

STUDY MATERIAL:
{study_material}

YOUR OUTPUT MUST BE EXACTLY ONE JSON OBJECT:

{{
  "question": "your question",
  "options": {{
    "A": "first option",
    "B": "second option",
    "C": "third option",
    "D": "fourth option"
  }},
  "correct_answer": "<A|B|C|D>"
}}

STRICT RULES:

1. Create a specific, meaningful question based directly on the study material.

2. The question must test a fact, definition, concept, relationship,
   process, comparison, cause/effect relationship, or application
   explicitly supported by the study material.

3. NEVER create vague questions such as:
   - "Which of the following is true?"
   - "What can be said about this?"
   - "Which statement is correct?"
   unless the question includes a specific subject or concept.

4. The question must be answerable using ONLY the study material.
   Do not use outside knowledge.

5. Create EXACTLY four options: A, B, C and D.

6. Only ONE option may be correct.

7. Every incorrect option must be a plausible distractor related to
   the same topic.

8. Distractors should represent realistic misconceptions or closely
   related concepts from the study material.

9. NEVER create duplicate or near-duplicate options.

10. NEVER make two options differ only by words such as:
    "can" vs "cannot"
    "is" vs "is not"
    "true" vs "false"

11. NEVER use meaningless, invented, or nonsensical words as options.

12. Keep all four options grammatically consistent with the question.

13. Do not make the correct answer obviously longer or more detailed
    than the distractors.

14. Do not include "All of the above" or "None of the above".

15. Do not mention the study material, passage, or source in the question.

16. Do not output explanations.

17. Do not output difficulty.

18. Do not output markdown.

19. Do not output any text before or after the JSON object.

20. "correct_answer" MUST be exactly one of:
    A, B, C, D
    
21. Distractors must test different plausible concepts, facts, or
    misconceptions. Do not use synonyms of the correct answer.

22. Do not create options that are merely different generic forms
    of the same answer, such as:
    "award", "prize", "medal", "recognition".

23. Do not create "State whether the following statements are true
    or false" questions.

24. Do not create four options that are full sentences differing
    only by a small phrase such as "pressure", "temperature",
    "both", or "either".

25. Prefer questions with a single concrete answer.

26. For definition questions, use related concepts as distractors,
    not generic synonyms.

27. For factual questions, make distractors come from other facts
    or concepts in the study material.

28. For conceptual questions, make distractors represent plausible
    misunderstandings of the concept.
    
29. Every distractor must belong to the same conceptual category as
    the correct answer.

30. Do not use unrelated terms or concepts as distractors.

31. For questions about biological tissues, all four options must
    be biological tissues or closely related tissue types.

32. For questions about functions, all four options must be
    plausible functions.

33. For classification questions, all four options must be valid
    members of the same classification.

34. Distractors must come from the study material whenever possible,
    especially for factual questions.

35. Do not use generic words such as "thing", "item", "award",
    "recognition", etc. as distractors unless they are specifically
    relevant to the study material.

36. Before returning the question, check that all four options are
    semantically comparable and belong to the same category.
    
37. 37. The correct answer may initially be assigned to any option.
    Do not intentionally place the correct answer in A.
    
38. The correct answer must be explicitly and unambiguously
    supported by the study material.

39. Before generating the question, identify the exact fact from
    the study material that supports the correct answer.

40. Do not reverse, contradict, or combine facts from the study
    material.

41. Do not create a question where the wording implies a relationship
    that is different from the relationship stated in the study
    material.

42. If the study material does not provide enough information to
    create a clear question, generate a different question instead.

Return ONLY the JSON object."""

def randomize_answer_position(data: dict[str, Any]) -> dict[str, Any]:
    options = data["options"]
    correct_text = options[data["correct_answer"]]

    shuffled = list(options.values())
    random.shuffle(shuffled)

    labels = ["A", "B", "C", "D"]

    new_options = {
        label: text
        for label, text in zip(labels, shuffled)
    }

    new_answer = next(
        label
        for label, text in new_options.items()
        if text == correct_text
    )

    data["options"] = new_options
    data["correct_answer"] = new_answer

    return data

def parse_mcq_output(raw_output: str) -> dict[str, Any]:
    """Extract and validate the JSON object returned by the model."""

    cleaned = raw_output.strip()

    # Remove accidental markdown code fences.
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        cleaned = "\n".join(
            line
            for line in lines
            if not line.strip().startswith("```")
        ).strip()

    # Find the JSON object even if the model accidentally adds text.
    start = cleaned.find("{")
    end = cleaned.rfind("}")

    if start < 0 or end <= start:
        raise ValueError(
            "Model output did not contain a JSON object"
        )

    try:
        data = json.loads(cleaned[start:end + 1])
    except json.JSONDecodeError as exc:
        raise ValueError(
            f"Model output was not valid JSON: {exc.msg}"
        ) from exc

    if not isinstance(data, dict):
        raise ValueError("Model output must be a JSON object")

    _validate_mcq(data)

    return data


def _validate_mcq(data: dict[str, Any]) -> None:
    """Validate the generated MCQ structure."""

    question = data.get("question")
    options = data.get("options")
    answer = data.get("correct_answer")

    if not isinstance(question, str) or not question.strip():
        raise ValueError(
            "Question must be a non-empty string"
        )

    if (
        not isinstance(options, dict)
        or set(options.keys()) != {"A", "B", "C", "D"}
    ):
        raise ValueError(
            "Options must contain exactly A, B, C and D"
        )

    if any(
        not isinstance(value, str) or not value.strip()
        for value in options.values()
    ):
        raise ValueError(
            "Every option must be a non-empty string"
        )

    normalized_options = {
        value.strip().casefold()
        for value in options.values()
    }

    if len(normalized_options) != 4:
        raise ValueError(
            "Option text must be unique"
        )

    if answer not in {"A", "B", "C", "D"}:
        raise ValueError(
            "correct_answer must be A, B, C or D"
        )
        
def _is_low_quality_mcq(data: dict[str, Any]) -> bool:
    question = data["question"].strip().lower()
    options = data["options"]

    # 1. Vague questions
    vague_patterns = [
        "which of the following is true",
        "which of the following is correct",
        "which statement is true",
        "which statement is correct",
        "what can be said about",
    ]

    if any(p in question for p in vague_patterns):
        return True

    # 2. None / all of the above
    bad_options = {
        "none",
        "none of the above",
        "all of the above",
        "all of these",
    }

    if any(
        option.strip().lower() in bad_options
        for option in options.values()
    ):
        return True

    # 3. Duplicate options
    normalized = [
        option.strip().lower()
        for option in options.values()
    ]

    if len(set(normalized)) != 4:
        return True

    # 4. Very similar options
    words = [set(x.split()) for x in normalized]

    for i in range(4):
        for j in range(i + 1, 4):
            intersection = words[i] & words[j]
            union = words[i] | words[j]

            if union and len(intersection) / len(union) > 0.85:
                return True

    # 5. True/false style
    if (
        "state whether" in question
        or "true or false" in question
    ):
        return True

    return False


class MCQGenerator:
    """Lazy Qwen + LoRA inference service."""

    def __init__(self) -> None:
        self._model = None
        self._tokenizer = None
        self._lock = threading.Lock()

        self.base_model_name = os.getenv(
            "MCQ_BASE_MODEL",
            "Qwen/Qwen2.5-1.5B-Instruct",
        )

        self.adapter_path = os.getenv(
            "MCQ_MODEL_PATH",
            "./mcq-qwen-final",
        )

        self.max_new_tokens = int(
            os.getenv("MCQ_MAX_NEW_TOKENS", "350")
        )

        self.temperature = float(
            os.getenv("MCQ_TEMPERATURE", "0.7")
        )

        self.top_p = float(
            os.getenv("MCQ_TOP_P", "0.9")
        )

        self.max_retries = int(
            os.getenv("MCQ_MAX_RETRIES", "3")
        )

    def _load(self) -> None:
        """Load the base Qwen model and LoRA adapter once."""

        if self._model is not None:
            return

        import torch
        from peft import PeftModel
        from transformers import (
            AutoModelForCausalLM,
            AutoTokenizer,
            BitsAndBytesConfig,
        )

        adapter_path = self.adapter_path

        if not os.path.isabs(adapter_path):
            adapter_path = os.path.abspath(adapter_path)

        if not os.path.isdir(adapter_path):
            raise FileNotFoundError(
                f"MCQ adapter directory not found: {adapter_path}"
            )

        use_cuda = torch.cuda.is_available()

        logger.info("Loading MCQ model...")
        logger.info(
            "Base model: %s",
            self.base_model_name,
        )
        logger.info(
            "Adapter: %s",
            adapter_path,
        )
        logger.info(
            "CUDA available: %s",
            use_cuda,
        )

        # ---------------------------------------------------------
        # TOKENIZER
        # ---------------------------------------------------------

        tokenizer = AutoTokenizer.from_pretrained(
            self.base_model_name
        )

        # ---------------------------------------------------------
        # MODEL
        # ---------------------------------------------------------

        if use_cuda:
            logger.info(
                "Using CUDA 4-bit NF4 inference"
            )

            bnb_config = BitsAndBytesConfig(
                load_in_4bit=True,
                bnb_4bit_quant_type="nf4",
                bnb_4bit_compute_dtype=torch.float16,
                bnb_4bit_use_double_quant=True,
            )

            base_model = AutoModelForCausalLM.from_pretrained(
                self.base_model_name,
                quantization_config=bnb_config,
                device_map="auto",
            )

        else:
            logger.warning(
                "CUDA is unavailable; "
                "CPU MCQ inference will be significantly slower"
            )

            base_model = AutoModelForCausalLM.from_pretrained(
                self.base_model_name,
                dtype=torch.float32,
            )

        # ---------------------------------------------------------
        # LORA ADAPTER
        # ---------------------------------------------------------

        logger.info("Loading LoRA adapter...")

        model = PeftModel.from_pretrained(
            base_model,
            adapter_path,
        )

        model.eval()

        self._tokenizer = tokenizer
        self._model = model

        if use_cuda:
            logger.info(
                "GPU: %s",
                torch.cuda.get_device_name(0),
            )

        logger.info("MCQ model ready.")

    def generate(
        self,
        study_material: str,
    ) -> dict[str, Any]:
        """Generate and validate one MCQ."""

        import torch

        with self._lock:
            self._load()

            prompt = PROMPT_TEMPLATE.format(
                study_material=study_material
            )

            last_error: Exception | None = None

            for attempt in range(
                self.max_retries + 1
            ):
                try:
                    # -------------------------------------------------
                    # CHAT TEMPLATE
                    # -------------------------------------------------

                    messages = [
                        {
                            "role": "user",
                            "content": prompt,
                        }
                    ]

                    if hasattr(
                        self._tokenizer,
                        "apply_chat_template",
                    ):
                        text = (
                            self._tokenizer
                            .apply_chat_template(
                                messages,
                                tokenize=False,
                                add_generation_prompt=True,
                            )
                        )
                    else:
                        text = prompt

                    # -------------------------------------------------
                    # TOKENIZE
                    # -------------------------------------------------

                    inputs = self._tokenizer(
                        text,
                        return_tensors="pt",
                    )

                    # Move tokenizer outputs to the model device.
                    device = next(
                        self._model.parameters()
                    ).device

                    inputs = {
                        key: value.to(device)
                        for key, value in inputs.items()
                    }

                    # -------------------------------------------------
                    # GENERATION
                    # -------------------------------------------------

                    with torch.inference_mode():

                        output = self._model.generate(
                            **inputs,
                            max_new_tokens=self.max_new_tokens,
                            do_sample=True,
                            temperature=self.temperature,
                            top_p=self.top_p,
                            pad_token_id=self._tokenizer.eos_token_id,
                        )
                    # Only decode newly generated tokens.
                    generated = output[
                        0
                    ][
                        inputs["input_ids"].shape[-1]:
                    ]

                    raw_output = self._tokenizer.decode(
                        generated,
                        skip_special_tokens=True,
                    )

                    logger.debug(
                        "Raw MCQ model output: %s",
                        raw_output,
                    )

                    # -------------------------------------------------
                    # PARSE + VALIDATE
                    # -------------------------------------------------

                    mcq = parse_mcq_output(raw_output)

                    if _is_low_quality_mcq(mcq):
                        raise ValueError(
                            "Generated MCQ failed quality checks"
                        )

                    # Randomize the correct answer position
                    mcq = randomize_answer_position(mcq)

                    return mcq

                except (
                    ValueError,
                    json.JSONDecodeError,
                ) as exc:

                    last_error = exc

                    logger.warning(
                        "Invalid MCQ model output "
                        "on attempt %d: %s",
                        attempt + 1,
                        exc,
                    )

                    prompt = (
                        PROMPT_TEMPLATE.format(
                            study_material=study_material
                        )
                        + """

                    IMPORTANT REVISION:

                    Your previous question was rejected because it was too vague.

                    DO NOT write:
                    "Which of the following is true?"
                    "Which of the following is correct?"
                    "Which statement is true?"

                    Instead, identify ONE specific fact or concept from the
                    study material and ask directly about it.

                    For example, instead of:
                    "Which of the following is true?"

                    write:
                    "What is the primary purpose of Router A according to
                    the study material?"

                    Create four distinct, plausible options.

                    Return ONLY the JSON object.
                    """
                    )

            raise ValueError(
                f"MCQ generation failed after retries: "
                f"{last_error}"
            ) from last_error


mcq_generator = MCQGenerator()