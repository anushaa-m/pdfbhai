import { CheckCircle2, ChevronRight, RotateCw, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { AppShell } from "@/components/AppShell";
import { loadSession, regenerateQuestion, saveSession, validateQuestion, type MCQ } from "@/lib/api";

const letters = ["A", "B", "C", "D"] as const;

export default function Questions() {
  const [, navigate] = useLocation();
  const [session, setSession] = useState(loadSession);
  const [activeId, setActiveId] = useState(session.questions[0]?.id || "");
  const [busyId, setBusyId] = useState<string | null>(null);
  const question = useMemo(() => session.questions.find(item => item.id === activeId) || session.questions[0], [activeId, session.questions]);

  const persistQuestions = (questions: MCQ[]) => {
    const next = { ...session, questions };
    setSession(next);
    saveSession(next);
  };

  const validate = async () => {
    if (!question) return;
    setBusyId(question.id);
    try {
      const result = await validateQuestion(question.id);
      if (result.is_valid) toast.success("Question is valid", { description: "Backend validation passed." });
      else toast.error("Question needs review", { description: result.issues.join(", ") || "Backend returned validation issues." });
    } catch (error) {
      toast.error("Validation failed", { description: error instanceof Error ? error.message : "Backend validation failed." });
    } finally {
      setBusyId(null);
    }
  };

  const regenerate = async () => {
    if (!question) return;
    setBusyId(question.id);
    try {
      const result = await regenerateQuestion(question.id);
      persistQuestions(session.questions.map(item => item.id === question.id ? result.question : item));
      setActiveId(result.question.id);
      toast.success("Question regenerated", { description: "Backend replaced this MCQ in the database." });
    } catch (error) {
      toast.error("Regeneration failed", { description: error instanceof Error ? error.message : "Backend regeneration failed." });
    } finally {
      setBusyId(null);
    }
  };

  if (!question) {
    return <AppShell title="Question Review" kicker="No generated questions"><div className="mx-auto max-w-2xl rounded-[1.5rem] border border-[#E4E9F4] bg-white p-8"><h2 className="font-display text-3xl tracking-[-.04em]">Generate questions first.</h2><p className="mt-3 text-[#65728A]">Upload a PDF and call the MCQ backend before reviewing questions.</p><div className="mt-6 flex gap-3"><Link href="/upload" className="btn-outline">Upload PDF</Link><Link href="/quiz-settings" className="btn-primary">Generate MCQs</Link></div></div></AppShell>;
  }

  return <AppShell title="Question Review" kicker="Backend question bank" action={<button onClick={() => navigate("/quiz")} className="btn-primary hidden sm:inline-flex">Take Quiz</button>}>
    <div className="grid gap-5 xl:grid-cols-[300px_1fr]">
      <aside className="rounded-[1.5rem] border border-[#E4E9F4] bg-white p-3 shadow-[0_12px_35px_rgba(36,57,94,.05)]"><div className="mt-3 space-y-1">{session.questions.map((item, index) => <button key={item.id} onClick={() => setActiveId(item.id)} className={`question-list-item ${item.id === question.id ? "active" : ""}`}><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-xs font-bold text-[#3B63E8] shadow-sm">{index + 1}</span><span className="min-w-0 flex-1 text-left"><span className="block truncate text-sm font-bold">{item.question}</span><span className="mt-1 block text-xs text-[#65728A]">{item.concept}</span></span><ChevronRight className="h-4 w-4" /></button>)}</div></aside>
      <section>
        <article className="rounded-[1.5rem] border border-[#E4E9F4] bg-white p-5 shadow-[0_14px_40px_rgba(36,57,94,.07)] sm:p-8">
          <div className="flex items-center justify-between gap-4"><span className="section-kicker !mb-0">{question.concept}</span><span className="rounded-full bg-[#F3F5FA] px-3 py-1 text-xs font-bold text-[#53617A]">{question.difficulty}</span></div>
          <h2 className="mt-6 font-display text-2xl leading-tight tracking-[-.035em] text-[#18233B] sm:text-3xl">{question.question}</h2>
          <div className="mt-7 space-y-3">{letters.map(letter => <div key={letter} className={`answer-option ${question.answer === letter ? "correct" : ""}`}><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-current text-xs font-bold">{letter}</span><span className="flex-1 text-left">{question.options[letter]}</span>{question.answer === letter && <CheckCircle2 className="h-5 w-5" aria-label="Correct answer" />}</div>)}</div>
          <div className="mt-7 rounded-2xl bg-[#F3F6FF] p-5"><p className="text-sm font-bold text-[#2A4BC2]">Source</p><p className="mt-1.5 leading-7 text-[#53617A]">Page {question.source_pages.join(", ") || "unknown"} · chunk {question.source_chunk}</p></div>
        </article>
        <aside className="mt-5 rounded-[1.5rem] bg-[#F3F6FF] p-6"><p className="text-sm font-bold text-[#2A4BC2]">Backend actions</p><div className="mt-4 flex flex-wrap gap-2"><button onClick={validate} disabled={busyId === question.id} className="btn-outline justify-center"><ShieldCheck className="h-4 w-4" /> Validate</button><button onClick={regenerate} disabled={busyId === question.id} className="btn-outline justify-center"><RotateCw className="h-4 w-4" /> Regenerate</button><button onClick={() => navigate("/quiz")} className="btn-primary justify-center">Take Quiz</button></div></aside>
      </section>
    </div>
  </AppShell>;
}
