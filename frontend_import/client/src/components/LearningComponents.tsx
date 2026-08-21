/** Scholarly Current design: reusable, tactile study artifacts with cobalt progress and quiet feedback. */
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Brain, ChartNoAxesCombined, Check, Lightbulb, PenLine, Target } from "lucide-react";
import { Link } from "wouter";

type Course = {
  code: string;
  color: string;
  icon: string;
  lesson: string;
  lessons: number;
  progress: number;
  title: string;
};

type Question = {
  answer: number;
  choices: string[];
  difficulty: string;
  explanation: string;
  text: string;
  topic: string;
};

const iconMap = { BookOpen, PenLine, Brain, Lightbulb, Chart: ChartNoAxesCombined, Target };

export function SectionKicker({ children }: { children: React.ReactNode }) { return <p className="section-kicker">{children}</p>; }

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  return <div className="w-full">
    {label && <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#53617A]"><span>{label}</span><span className="text-[#18233B]">{value}%</span></div>}
    <div className="h-2 overflow-hidden rounded-full bg-[#E7EBF5]"><motion.div initial={{ width: 0 }} whileInView={{ width: `${value}%` }} viewport={{ once: true }} transition={{ duration: .7, ease: "circOut" }} className="h-full rounded-full bg-[#3B63E8]" /></div>
  </div>;
}

export function ProgressCircle({ value, size = 86 }: { value: number; size?: number }) {
  const radius = 38, length = 2 * Math.PI * radius;
  return <div className="relative grid place-items-center" style={{ width: size, height: size }} aria-label={`${value}% progress`}>
    <svg viewBox="0 0 92 92" className="absolute h-full w-full -rotate-90"><circle cx="46" cy="46" r={radius} fill="none" stroke="#E7EBF5" strokeWidth="8" /><motion.circle cx="46" cy="46" r={radius} fill="none" stroke="#3B63E8" strokeLinecap="round" strokeWidth="8" strokeDasharray={length} initial={{ strokeDashoffset: length }} whileInView={{ strokeDashoffset: length * (1 - value / 100) }} viewport={{ once: true }} transition={{ duration: 1, ease: "easeOut" }} /></svg>
    <span className="relative text-lg font-extrabold tracking-[-.06em] text-[#18233B]">{value}%</span>
  </div>;
}

export function CourseCard({ course, featured = false }: { course: Course; featured?: boolean }) {
  return <motion.article whileHover={{ y: -5 }} transition={{ duration: .2 }} className={`study-card group ${featured ? "md:col-span-2" : ""}`}>
    <div className="mb-8 flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-2xl text-xs font-bold text-white shadow-sm" style={{ backgroundColor: course.color }}>{course.icon}</span><span className="rounded-full bg-[#F3F5FA] px-3 py-1 text-[11px] font-bold tracking-wide text-[#53617A]">{course.code}</span></div>
    <h3 className="font-display text-2xl tracking-[-.035em] text-[#18233B]">{course.title}</h3><p className="mt-2 text-sm text-[#65728A]">Last lesson · <span className="font-semibold text-[#33405A]">{course.lesson}</span></p>
    <div className="mt-7"><ProgressBar value={course.progress} label={`${course.lessons} lessons`} /></div>
    <Link href="/quiz" className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-[#3B63E8] transition group-hover:gap-2.5">Continue Learning <ArrowRight className="h-4 w-4" /></Link>
  </motion.article>;
}

export function FeatureCard({ title, text, icon }: { title: string; text: string; icon: keyof typeof iconMap }) {
  const Icon = iconMap[icon];
  return <motion.article whileHover={{ y: -6 }} className="feature-card"><div className="feature-icon"><Icon className="h-5 w-5" /></div><h3 className="mt-7 font-display text-xl tracking-[-.025em] text-[#18233B]">{title}</h3><p className="mt-2 leading-7 text-[#65728A]">{text}</p><div className="mt-6 h-px w-10 bg-[#CBD5EE] transition-all duration-200 group-hover:w-16" /></motion.article>;
}

export function QuestionCard({ question, selected, onSelect, showAnswer = false }: { question: Question; selected?: number; onSelect?: (index: number) => void; showAnswer?: boolean }) {
  return <article className="rounded-[1.5rem] border border-[#E4E9F4] bg-white p-5 shadow-[0_14px_40px_rgba(36,57,94,.07)] sm:p-8"><div className="flex items-center justify-between gap-4"><span className="section-kicker !mb-0">{question.topic}</span><span className="rounded-full bg-[#F3F5FA] px-3 py-1 text-xs font-bold text-[#53617A]">{question.difficulty}</span></div><h2 className="mt-6 font-display text-2xl leading-tight tracking-[-.035em] text-[#18233B] sm:text-3xl">{question.text}</h2><div className="mt-7 space-y-3">{question.choices.map((choice, index) => { const isSelected = selected === index, isCorrect = question.answer === index; const reveal = showAnswer && (isCorrect || isSelected); return <button type="button" key={choice} onClick={() => onSelect?.(index)} className={`answer-option ${isSelected ? "selected" : ""} ${reveal && isCorrect ? "correct" : ""} ${reveal && isSelected && !isCorrect ? "incorrect" : ""}`}><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-current text-xs font-bold">{String.fromCharCode(65 + index)}</span><span className="flex-1 text-left">{choice}</span>{reveal && isCorrect && <Check className="h-5 w-5" aria-label="Correct answer" />}</button>; })}</div>{showAnswer && <div className="mt-7 rounded-2xl bg-[#F3F6FF] p-5"><p className="text-sm font-bold text-[#2A4BC2]">Explanation</p><p className="mt-1.5 leading-7 text-[#53617A]">{question.explanation}</p></div>}</article>;
}
