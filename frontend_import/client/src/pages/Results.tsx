import { ArrowRight, CheckCircle2, CircleX, ListChecks } from "lucide-react";
import { Link } from "wouter";
import { AppShell } from "@/components/AppShell";
import { ProgressCircle } from "@/components/LearningComponents";
import { loadSession } from "@/lib/api";

export default function Results() {
  const session = loadSession();
  const total = session.questions.length;
  const answered = Object.keys(session.answers).length;
  const correct = session.questions.filter(item => session.answers[item.id] === item.answer).length;
  const incorrect = answered - correct;
  const score = answered ? Math.round((correct / answered) * 100) : 0;

  return <AppShell title="Quiz Complete" kicker={session.upload?.filename || "Backend results"}>
    <div className="mx-auto max-w-5xl">
      <section className="grid gap-6 rounded-[2rem] bg-[#18233B] p-7 text-white shadow-[0_24px_65px_rgba(24,35,59,.2)] sm:grid-cols-[.9fr_1.1fr] sm:p-10">
        <div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#AFC1FF]">Your result</p><h2 className="mt-3 font-display text-5xl tracking-[-.065em] sm:text-6xl">{score >= 70 ? "Strong work." : "Keep practicing."}</h2><p className="mt-4 max-w-sm leading-7 text-white/65">This score is calculated from the MCQs returned by the backend for your uploaded PDF.</p><div className="mt-8 flex gap-3"><Link href="/questions" className="btn-light">Review questions <ArrowRight className="h-4 w-4" /></Link><Link href="/quiz-settings" className="btn-dark-outline">Generate again</Link></div></div>
        <div className="grid place-items-center rounded-[1.5rem] bg-white p-7 text-[#18233B]"><ProgressCircle value={score} size={138} /><p className="mt-4 text-sm font-bold">Your quiz score</p><p className="mt-1 text-xs text-[#65728A]">{correct} correct of {answered} answered</p></div>
      </section>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="stat-card"><CheckCircle2 className="h-5 w-5 text-[#21867E]" /><p className="mt-6 text-xs font-bold uppercase tracking-[.12em] text-[#65728A]">Correct</p><p className="mt-1 font-display text-4xl tracking-[-.06em]">{correct}</p></article>
        <article className="stat-card"><CircleX className="h-5 w-5 text-[#C76A33]" /><p className="mt-6 text-xs font-bold uppercase tracking-[.12em] text-[#65728A]">Incorrect</p><p className="mt-1 font-display text-4xl tracking-[-.06em]">{incorrect}</p></article>
        <article className="stat-card"><ListChecks className="h-5 w-5 text-[#3B63E8]" /><p className="mt-6 text-xs font-bold uppercase tracking-[.12em] text-[#65728A]">Attempted</p><p className="mt-1 font-display text-4xl tracking-[-.06em]">{answered}/{total}</p></article>
        <article className="stat-card"><ListChecks className="h-5 w-5 text-[#7667D8]" /><p className="mt-6 text-xs font-bold uppercase tracking-[.12em] text-[#65728A]">Generated</p><p className="mt-1 font-display text-4xl tracking-[-.06em]">{total}</p></article>
      </div>
    </div>
  </AppShell>;
}
