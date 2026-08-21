export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export type UploadResponse = {
  pdf_id: string;
  filename: string;
  num_pages: number;
  num_chunks: number;
};

export type MCQ = {
  id: string;
  question: string;
  options: Record<"A" | "B" | "C" | "D", string>;
  answer: "A" | "B" | "C" | "D";
  difficulty: "easy" | "medium" | "hard";
  concept: string;
  explanation: string;
  source_pages: number[];
  source_chunk: string;
};

export type GenerateMCQsResponse = {
  pdf_id: string;
  questions: MCQ[];
};

export type QuizSession = {
  upload?: UploadResponse;
  questions: MCQ[];
  answers: Record<string, "A" | "B" | "C" | "D">;
};

const SESSION_KEY = "quizai-backend-session";

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.ok) return response.json() as Promise<T>;
  let message = `Request failed with status ${response.status}`;
  try {
    const body = await response.json();
    message = body.detail || message;
  } catch {
    /* keep fallback */
  }
  throw new Error(Array.isArray(message) ? message.join(", ") : message);
}

export async function uploadPdf(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_BASE_URL}/upload`, { method: "POST", body: formData });
  return parseResponse<UploadResponse>(response);
}

export async function generateMcqs(pdfId: string, numQuestions: number, difficulty?: "easy" | "medium" | "hard"): Promise<GenerateMCQsResponse> {
  const body = {
    pdf_id: pdfId,
    num_questions: numQuestions,
    difficulty_mix: difficulty ? [difficulty] : undefined,
  };
  const response = await fetch(`${API_BASE_URL}/generate-mcqs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseResponse<GenerateMCQsResponse>(response);
}

export async function validateQuestion(questionId: string) {
  const response = await fetch(`${API_BASE_URL}/validate-question`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question_id: questionId }),
  });
  return parseResponse<{ question_id: string; is_valid: boolean; issues: string[] }>(response);
}

export async function regenerateQuestion(questionId: string) {
  const response = await fetch(`${API_BASE_URL}/regenerate-question`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question_id: questionId }),
  });
  return parseResponse<{ question: MCQ }>(response);
}

export function loadSession(): QuizSession {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : { questions: [], answers: {} };
  } catch {
    return { questions: [], answers: {} };
  }
}

export function saveSession(session: QuizSession) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}
