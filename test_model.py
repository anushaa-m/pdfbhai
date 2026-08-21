import torch
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    BitsAndBytesConfig,
)
from peft import PeftModel

BASE_MODEL = "Qwen/Qwen2.5-1.5B-Instruct"
ADAPTER = "./mcq-qwen-final"

print("CUDA:", torch.cuda.is_available())

if torch.cuda.is_available():
    print("GPU:", torch.cuda.get_device_name(0))

print("\nLoading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)

print("Loading Qwen in 4-bit...")

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True,
)

base_model = AutoModelForCausalLM.from_pretrained(
    BASE_MODEL,
    quantization_config=bnb_config,
    device_map="auto",
)

print("Loading LoRA adapter...")

model = PeftModel.from_pretrained(
    base_model,
    ADAPTER,
)

model.eval()

print("\nMODEL READY")
print("Device:", model.device)

context = """
Agriculture is a primary economic activity. It includes growing crops,
fruits, vegetables and flowers and rearing livestock. Farming can be
classified into subsistence farming and commercial farming. Commercial
farming involves growing crops and rearing animals primarily for sale
in the market.
"""

prompt = f"""You are an MCQ generator.

Create EXACTLY ONE multiple-choice question using ONLY the study material below.

STUDY MATERIAL:
{context}

YOUR OUTPUT MUST BE EXACTLY ONE JSON OBJECT.

{{
  "question": "your question",
  "options": {{
    "A": "first option",
    "B": "second option",
    "C": "third option",
    "D": "fourth option"
  }},
  "correct_answer": "A"
}}

RULES:
1. "question" must contain only the question.
2. "options" MUST contain exactly A, B, C and D.
3. Each option must be a string.
4. "correct_answer" MUST be exactly one of A, B, C or D.
5. Do NOT output markdown.
6. Do NOT output any text before or after the JSON object.
7. Every distractor must be plausible and relevant.
8. Do not invent meaningless words.

Return ONLY the JSON object.
"""

messages = [
    {
        "role": "system",
        "content": "You generate structured educational multiple-choice questions."
    },
    {
        "role": "user",
        "content": prompt
    }
]

text = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
)

inputs = tokenizer(
    text,
    return_tensors="pt",
).to(model.device)

print("\nGenerating MCQ...")

with torch.inference_mode():
    outputs = model.generate(
        **inputs,
        max_new_tokens=350,
        do_sample=False,
        pad_token_id=tokenizer.eos_token_id,
    )

generated = outputs[0][inputs["input_ids"].shape[1]:]

result = tokenizer.decode(
    generated,
    skip_special_tokens=True,
)

print("\n" + "=" * 60)
print("MODEL OUTPUT")
print("=" * 60)
print(result)
print("=" * 60)