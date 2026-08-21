/** Scholarly Current design: the folded-study-sheet mark and editorial wordmark anchor every learning surface. */
import { Link } from "wouter";

export function Brand({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className="inline-flex items-center gap-2.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B63E8]">
    <img src="/manus-storage/quizai-brand-mark_1d9461fd.png" alt="QuizAI" className="h-10 w-10 object-contain" />
    {!compact && <span className="font-display text-[1.55rem] leading-none tracking-[-0.05em] text-[#18233B]">Quiz<span className="text-[#3B63E8]">AI</span></span>}
  </Link>;
}
