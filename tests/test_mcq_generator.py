import json
import unittest

from app.services.mcq_generator import parse_mcq_output


class MCQGeneratorTests(unittest.TestCase):
    def test_parse_mcq_output_accepts_json_code_fence_and_extra_text(self):
        output = """Here is the question:
```json
{"question": "What is commercial farming?", "options": {"A": "Farming for sale", "B": "Farming only for family use", "C": "Moving with livestock", "D": "Growing wild plants"}, "correct_answer": "A"}
```
"""

        mcq = parse_mcq_output(output)

        self.assertEqual(set(mcq["options"]), {"A", "B", "C", "D"})
        self.assertEqual(mcq["correct_answer"], "A")
        json.dumps(mcq)


    def test_parse_mcq_output_rejects_duplicate_options(self):
        with self.assertRaisesRegex(ValueError, "unique"):
            parse_mcq_output(
                '{"question":"A meaningful question?", "options": {"A":"same", "B":"same", "C":"third", "D":"fourth"}, "correct_answer":"A"}'
            )


if __name__ == "__main__":
    unittest.main()