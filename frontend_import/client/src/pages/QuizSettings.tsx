import { Check, Shuffle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { AppShell } from "@/components/AppShell";
import { generateMcqs, loadSession, saveSession } from "@/lib/api";

type Difficulty = "easy" | "medium" | "hard";

export default function QuizSettings() {
  const [, navigate] = useLocation();
  const [questions, setQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [busy, setBusy] = useState(false);
  const upload = loadSession().upload;

  const createQuestions = async () => {
    if (!upload) {
      toast.error("Upload a PDF first.");
      navigate("/upload");
      return;
    }
    setBusy(true);
    try {
      const result = await generateMcqs(upload.pdf_id, questions, difficulty);
      saveSession({ upload, questions: result.questions, answers: {} });
      toast.success("MCQs generated", { description: `${result.questions.length} questions returned from Qwen.` });
      navigate("/questions");
    } catch (error) {
      toast.error("Question generation failed", { description: error instanceof Error ? error.message : "Backend generation failed." });
    } finally {
      setBusy(false);
    }
  };

  const ChoiceRow = ({ label, children }: { label: string; children: React.ReactNode }) => <div className="border-b border-[#E9EDF5] py-7 last:border-0"><h2 className="font-display text-2xl tracking-[-.035em]">{label}</h2><div className="mt-4 flex flex-wrap gap-2">{children}</div></div>;
  const Option = ({ selected, children, onClick }: { selected: boolean; children: React.ReactNode; onClick: () => void }) => <button onClick={onClick} disabled={busy} className={`choice-chip ${selected ? "selected" : ""}`}>{selected && <Check className="h-4 w-4" />}{children}</button>;

  return <AppShell title="Generate Backend Questions" kicker="Qwen MCQ generation" action={!upload && <Link href="/upload" className="btn-outline hidden sm:inline-flex">Upload PDF</Link>}>
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1fr_.55fr]">
      <section className="rounded-[1.75rem] border border-[#E4E9F4] bg-white px-6 shadow-[0_12px_35px_rgba(36,57,94,.05)] sm:px-8">
        <ChoiceRow label="Number of questions">{[5, 10, 20, 30, 50].map(value => <Option key={value} selected={questions === value} onClick={() => setQuestions(value)}>{value}</Option>)}</ChoiceRow>
        <ChoiceRow label="Difficulty">{(["easy", "medium", "hard"] as Difficulty[]).map(value => <Option key={value} selected={difficulty === value} onClick={() => setDifficulty(value)}>{value[0].toUpperCase() + value.slice(1)}</Option>)}</ChoiceRow>
      </section>
      <aside className="h-fit rounded-[1.75rem] bg-[#18233B] p-6 text-white sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[.14em] text-[#AFC1FF]">Backend request</p>
        <h2 className="mt-3 font-display text-3xl tracking-[-.045em]">{upload?.filename || "No PDF uploaded"}</h2>
        <div className="mt-8 space-y-4 border-y border-white/10 py-6 text-sm"><div className="flex justify-between"><span className="text-white/60">Questions</span><strong>{questions}</strong></div><div className="flex justify-between"><span className="text-white/60">Difficulty</span><strong>{difficulty}</strong></div><div className="flex justify-between"><span className="text-white/60">Endpoint</span><strong>/generate-mcqs</strong></div></div>
        <button onClick={createQuestions} disabled={busy || !upload} className="btn-light mt-8 w-full justify-center disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Generating..." : "Generate MCQs"} <Shuffle className="h-4 w-4" /></button>
      </aside>
    </div>
  </AppShell>;
}
