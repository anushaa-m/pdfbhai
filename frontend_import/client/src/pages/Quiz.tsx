import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, CheckCircle2, Send } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { AppShell } from "@/components/AppShell";
import { ProgressBar } from "@/components/LearningComponents";
import { loadSession, saveSession } from "@/lib/api";

const letters = ["A", "B", "C", "D"] as const;

export default function Quiz() {
  const [, navigate] = useLocation();
  const [session, setSession] = useState(loadSession);
  const [current, setCurrent] = useState(0);
  const [feedback, setFeedback] = useState(false);
  const question = session.questions[current];

  if (!question) {
    return <AppShell title="Practice Quiz" kicker="No questions"><div className="mx-auto max-w-2xl rounded-[1.5rem] border border-[#E4E9F4] bg-white p-8"><h2 className="font-display text-3xl tracking-[-.04em]">No generated MCQs yet.</h2><p className="mt-3 text-[#65728A]">Generate backend questions before starting practice.</p><div className="mt-6 flex gap-3"><Link href="/upload" className="btn-outline">Upload PDF</Link><Link href="/quiz-settings" className="btn-primary">Generate MCQs</Link></div></div></AppShell>;
  }

  const selected = session.answers[question.id];
  const progress = Math.round(((current + 1) / session.questions.length) * 100);
  const correctCount = session.questions.filter(item => session.answers[item.id] === item.answer).length;
  const answeredCount = Object.keys(session.answers).length;

  const choose = (answer: typeof letters[number]) => {
    const next = { ...session, answers: { ...session.answers, [question.id]: answer } };
    setSession(next);
    saveSession(next);
    setFeedback(true);
  };

  const next = () => {
    if (current === session.questions.length - 1) navigate("/results");
    else {
      setCurrent(value => value + 1);
      setFeedback(false);
    }
  };

  return <AppShell title="Practice Quiz" kicker={session.upload?.filename || "Generated MCQs"}>
    <div className="reference-quiz-grid">
      <section className="reference-practice-sheet">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="reference-section-label">{question.concept} · {question.difficulty}</p><h2>Concept Practice</h2></div></div>
        <div className="mt-8 border-b border-[#E9E5DA] pb-5"><p className="text-sm text-[#74766D]">Question {current + 1} of {session.questions.length}</p><h3>{question.question}</h3><div className="mt-5"><ProgressBar value={progress} /></div></div>
        <AnimatePresence mode="wait"><motion.div key={question.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: .2 }} className="reference-answer-grid">{letters.map((letter) => { const correct = question.answer === letter; const answerSelected = selected === letter; const state = feedback && correct ? "correct" : feedback && answerSelected ? "incorrect" : answerSelected ? "selected" : ""; return <button key={letter} onClick={() => choose(letter)} className={`reference-answer ${state}`}><span className="answer-tick">{feedback && correct ? <Check className="h-4 w-4" /> : letter}</span><span>{question.options[letter]}</span><span className="answer-radio">{answerSelected && <i />}</span></button>; })}</motion.div></AnimatePresence>
        {feedback && <div className={`reference-feedback ${selected === question.answer ? "correct" : "review"}`}><CheckCircle2 className="h-4 w-4" />{selected === question.answer ? "Correct." : `Correct answer: ${question.answer}. ${question.explanation || ""}`}</div>}
        <button onClick={next} disabled={selected === undefined} className="reference-next-btn">{current === session.questions.length - 1 ? <>Submit Quiz <Send className="h-4 w-4" /></> : <>Next Question <ArrowRight className="h-4 w-4" /></>}</button>
      </section>
      <aside className="reference-report-column"><article className="reference-report-card"><h2>Score</h2><div className="mt-6 flex items-end gap-3"><strong>{answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0}%</strong><span>{correctCount} correct out of {answeredCount} answered</span></div></article><article className="reference-study-note"><p>Answers are checked against the backend-generated correct option.</p></article></aside>
    </div>
  </AppShell>;
}
