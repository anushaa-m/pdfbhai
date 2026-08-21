export type Course = {
  id: number;
  code: string;
  color: string;
  icon: string;
  lesson: string;
  lessons: number;
  progress: number;
  title: string;
};

export type Question = {
  id: number;
  text: string;
  choices: string[];
  answer: number;
  topic: string;
  difficulty: string;
  explanation: string;
};

export const courses: Course[] = [
  { id: 1, code: "PDF", color: "#3B63E8", icon: "P", lesson: "Generated MCQs", lessons: 1, progress: 70, title: "Uploaded PDF" },
  { id: 2, code: "AI", color: "#21867E", icon: "Q", lesson: "Qwen practice", lessons: 1, progress: 55, title: "Qwen Quiz" },
];

export const quizQuestions: Question[] = [
  {
    id: 1,
    text: "Which endpoint uploads a PDF to the backend?",
    choices: ["/upload", "/generate-mcqs", "/validate-question", "/regenerate-question"],
    answer: 0,
    topic: "Backend",
    difficulty: "Medium",
    explanation: "The FastAPI backend accepts PDFs at /upload.",
  },
];

export const resources = [
  { title: "Uploaded PDFs", detail: "Documents sent to the backend.", count: "Backend", tone: "blue" },
  { title: "Generated MCQs", detail: "Questions returned by Qwen.", count: "Qwen", tone: "green" },
];

export const featureCards = [
  { title: "Upload PDFs", text: "Send study material to the backend.", icon: "BookOpen" as const },
  { title: "Generate MCQs", text: "Create questions with the connected model.", icon: "Brain" as const },
  { title: "Practice", text: "Answer generated questions in the browser.", icon: "Target" as const },
];

export const workflow = [
  { step: "01", title: "Upload", text: "Choose a PDF file." },
  { step: "02", title: "Generate", text: "Call the MCQ endpoint." },
  { step: "03", title: "Practice", text: "Review answers and score." },
];

export const faq = [
  ["Which backend is used?", "The app calls the local FastAPI backend."],
];

export const weeklyActivity = [
  { day: "Mon", minutes: 20 },
  { day: "Tue", minutes: 35 },
  { day: "Wed", minutes: 25 },
  { day: "Thu", minutes: 45 },
];

export const performanceData = [
  { name: "W1", score: 72 },
  { name: "W2", score: 81 },
  { name: "W3", score: 88 },
];

export const topicData = [
  { topic: "PDF", score: 82 },
  { topic: "MCQs", score: 76 },
  { topic: "Review", score: 90 },
];

export const quizHistory = [
  { title: "Generated PDF Quiz", questions: 10, date: "Today", score: 80, color: "#3B63E8" },
];
