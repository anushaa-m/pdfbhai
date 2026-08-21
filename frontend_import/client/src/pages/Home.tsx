/** Scholarly Current design: an asymmetric learning ribbon where editorial type and layered study artifacts guide the learner from notes to progress. */
import { AnimatePresence, motion, useInView } from "framer-motion";
import type { Variants } from "framer-motion";
import { ArrowRight, BookOpen, Check, ChevronDown, FileText, Menu, Play, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Brand } from "@/components/Brand";
import { FeatureCard, ProgressBar, SectionKicker } from "@/components/LearningComponents";
import { faq, featureCards, resources, workflow } from "@/data/mockData";

const reveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "circOut" } },
};

function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true });
  return <span ref={ref}>{visible ? value : 0}{suffix}</span>;
}

const siteLinks = [["Home", "top"], ["How It Works", "how-it-works"], ["Features", "features"], ["Learning", "learning"], ["Resources", "resources"], ["FAQ", "faq"]];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const jump = (id: string) => {
    setMobile(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F8F9FC] text-[#18233B]">
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-[#E4E9F4] bg-white/88 shadow-[0_8px_30px_rgba(29,44,74,.06)] backdrop-blur-xl" : "bg-transparent"}`}>
        <div className="mx-auto flex h-[76px] max-w-[1340px] items-center justify-between px-5 lg:px-9">
          <Brand />
          <nav className="hidden items-center gap-7 text-sm font-semibold text-[#53617A] lg:flex" aria-label="Primary navigation">
            {siteLinks.map(([label, id]) => <button key={id} onClick={() => jump(id)} className="transition hover:text-[#3B63E8]">{label}</button>)}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/dashboard" className="btn-quiet">Log in</Link>
            <Link href="/upload" className="btn-primary">Get Started <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <button onClick={() => setMobile(!mobile)} className="grid h-10 w-10 place-items-center rounded-xl border border-[#E4E9F4] bg-white text-[#18233B] lg:hidden" aria-label="Toggle navigation">
            {mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobile && <div className="border-t border-[#E4E9F4] bg-white px-5 py-5 shadow-xl lg:hidden">
          <nav className="flex flex-col gap-1">
            {siteLinks.map(([label, id]) => <button key={id} onClick={() => jump(id)} className="rounded-xl px-3 py-3 text-left text-sm font-bold text-[#53617A] hover:bg-[#F3F6FF]">{label}</button>)}
            <Link href="/upload" className="btn-primary mt-3 justify-center">Create your first quiz</Link>
          </nav>
        </div>}
      </header>

      <main id="top">
        <section className="hero-grid relative isolate overflow-hidden pt-[125px] lg:pt-[160px]">
          <div className="hero-glow hero-glow-a" /><div className="hero-glow hero-glow-b" />
          <div className="mx-auto grid max-w-[1340px] items-center gap-12 px-5 pb-24 lg:grid-cols-[.9fr_1.1fr] lg:px-9 lg:pb-32">
            <motion.div initial="hidden" animate="visible" variants={reveal} className="relative z-10 max-w-xl">
              <SectionKicker>Notes become meaningful practice</SectionKicker>
              <h1 className="font-display text-[3.35rem] leading-[.98] tracking-[-.065em] text-[#18233B] sm:text-7xl">Turn Your Notes Into <span className="text-[#3B63E8]">Smarter Practice.</span></h1>
              <p className="mt-7 max-w-lg text-lg leading-8 text-[#5C6A82]">Upload your PDF notes and create personalized MCQs to understand, practice, and test your knowledge.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/upload" className="btn-primary btn-large">Create Your First Quiz <ArrowRight className="h-5 w-5" /></Link>
                <button onClick={() => jump("how-it-works")} className="btn-outline btn-large"><Play className="h-4 w-4 fill-[#3B63E8] text-[#3B63E8]" /> Explore How It Works</button>
              </div>
              <div className="mt-12 flex items-center gap-7 border-l-2 border-[#C9D5FF] pl-5">
                <div><p className="font-display text-3xl tracking-[-.05em]"><CountUp value={240} suffix="+" /></p><p className="mt-1 text-xs font-semibold text-[#65728A]">study sessions supported</p></div>
                <div className="h-10 w-px bg-[#DDE3F0]" />
                <div><p className="font-display text-3xl tracking-[-.05em]"><CountUp value={87} suffix="%" /></p><p className="mt-1 text-xs font-semibold text-[#65728A]">average practice score</p></div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.12, ease: "circOut" }} className="relative min-h-[410px] lg:min-h-[560px]">
              <img src="/manus-storage/quizai-hero-learning-journey_284c8b66.png" alt="Study notes becoming learning concepts, practice questions, and progress" className="absolute inset-0 h-full w-full object-cover object-center" />
              <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }} className="absolute left-[4%] top-[13%] hidden rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-[0_18px_40px_rgba(39,62,111,.12)] backdrop-blur sm:block">
                <div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#EDF2FF]"><FileText className="h-4 w-4 text-[#3B63E8]" /></span><div><p className="text-xs font-bold">Machine Learning Notes</p><p className="text-[10px] text-[#697690]">PDF · 28 pages</p></div></div>
              </motion.div>
              <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 5.3, repeat: Infinity, ease: "easeInOut", delay: 0.8 }} className="absolute bottom-[7%] right-[2%] rounded-2xl border border-white/80 bg-white/92 p-4 shadow-[0_18px_40px_rgba(39,62,111,.12)] backdrop-blur">
                <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-[#EAF8F5] text-sm font-extrabold text-[#21867E]">85</div><div><p className="text-xs font-bold">Quiz Progress</p><p className="text-[11px] text-[#697690]">8 of 10 complete</p></div></div>
              </motion.div>
            </motion.div>
          </div>
          <div className="relative mx-auto max-w-[1340px] px-5 lg:px-9"><div className="learning-ribbon"><span>STUDY</span><ArrowRight /><span>PRACTICE</span><ArrowRight /><span>TEST</span><ArrowRight /><span>REVIEW</span><ArrowRight /><span>IMPROVE</span></div></div>
        </section>

        <section id="how-it-works" className="bg-white py-24 lg:py-32">
          <div className="mx-auto max-w-[1340px] px-5 lg:px-9"><div className="grid gap-9 lg:grid-cols-[.75fr_1.25fr]">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={reveal}>
              <SectionKicker>A learning workflow that stays with you</SectionKicker><h2 className="font-display text-5xl leading-[1.02] tracking-[-.055em] lg:text-6xl">A considered path from notes to confidence.</h2>
              <p className="mt-6 max-w-sm leading-7 text-[#65728A]">Every interaction has a job: make the material clearer, give you focused practice, or show your next opportunity to improve.</p>
              <Link href="/upload" className="btn-outline mt-8">Upload your notes <ArrowRight className="h-4 w-4" /></Link>
            </motion.div>
            <div className="relative"><div className="workflow-line hidden lg:block" />{workflow.map((item, index) => <motion.article key={item.step} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={{ hidden: { opacity: 0, x: 18 }, visible: { opacity: 1, x: 0, transition: { delay: index * 0.06, duration: 0.45 } } }} className="workflow-step"><span className="workflow-index">{item.step}</span><div><h3 className="font-display text-2xl tracking-[-.03em]">{item.title}</h3><p className="mt-1.5 max-w-xl leading-7 text-[#65728A]">{item.text}</p></div><span className="hidden h-9 w-9 place-items-center rounded-full bg-[#F3F6FF] text-[#3B63E8] sm:grid"><ArrowRight className="h-4 w-4" /></span></motion.article>)}</div>
          </div></div>
        </section>

        <section id="features" className="relative overflow-hidden bg-[#F3F6FF] py-24 lg:py-32"><div className="mx-auto max-w-[1340px] px-5 lg:px-9"><div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr]">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}><SectionKicker>Built for a fuller learning experience</SectionKicker><h2 className="font-display text-5xl leading-[1.02] tracking-[-.055em] lg:text-6xl">Everything You Need to Learn Better.</h2><p className="mt-6 max-w-md leading-7 text-[#65728A]">QuizAI is more than a question generator. It helps turn study materials into an ongoing practice system.</p><img src="/manus-storage/quizai-learning-resource-illustration_85538429.png" alt="Organized study materials on a desk" className="mt-10 w-full max-w-sm rounded-[2rem]" /></motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:pt-12">{featureCards.map((feature, index) => <motion.div key={feature.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: index * 0.06, duration: 0.45 } } }}><FeatureCard title={feature.title} text={feature.text} icon={feature.icon as never} /></motion.div>)}</div>
        </div></div></section>

        <section id="learning" className="bg-white py-24 lg:py-32"><div className="mx-auto grid max-w-[1340px] items-center gap-12 px-5 lg:grid-cols-[1.05fr_.95fr] lg:px-9">
          <div className="rounded-[2rem] bg-[#18233B] p-5 shadow-[0_26px_70px_rgba(24,35,59,.2)] sm:p-8"><div className="rounded-[1.4rem] bg-[#F8F9FC] p-5 sm:p-7"><div className="flex items-start justify-between"><div><SectionKicker>Practice session</SectionKicker><h3 className="font-display text-3xl tracking-[-.04em]">Machine Learning</h3><p className="mt-1 text-sm text-[#65728A]">Classification Algorithms</p></div><span className="rounded-full bg-[#EAF8F5] px-3 py-1 text-xs font-bold text-[#21867E]">In progress</span></div><div className="mt-9"><p className="text-sm font-bold text-[#3B63E8]">Question 4 of 10</p><h4 className="mt-3 font-display text-2xl leading-snug tracking-[-.025em]">What does a classifier learn to predict?</h4><div className="mt-5 grid gap-2"><div className="rounded-xl border border-[#3B63E8] bg-[#F3F6FF] px-4 py-3 text-sm font-semibold text-[#253451]">A. A category or class label <Check className="float-right h-4 w-4 text-[#3B63E8]" /></div><div className="rounded-xl border border-[#E4E9F4] bg-white px-4 py-3 text-sm text-[#53617A]">B. A continuous number only</div></div></div><div className="mt-8"><ProgressBar value={40} /></div></div></div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}><SectionKicker>Practice without the pressure</SectionKicker><h2 className="font-display text-5xl leading-[1.02] tracking-[-.055em] lg:text-6xl">The question is only the beginning.</h2><p className="mt-6 max-w-md leading-7 text-[#65728A]">A calm quiz surface supports understanding with explanations, concept links, and an easy way back to your study material.</p><div className="mt-8 space-y-4"><div className="flex gap-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#EDF2FF] text-[#3B63E8]"><Check className="h-4 w-4" /></span><p className="pt-1.5 text-sm leading-6 text-[#53617A]"><strong className="text-[#18233B]">Clear answer states</strong> use words, icons, and contrast—not color alone.</p></div><div className="flex gap-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#EEF8F7] text-[#21867E]"><Sparkles className="h-4 w-4" /></span><p className="pt-1.5 text-sm leading-6 text-[#53617A]"><strong className="text-[#18233B]">Focused explanations</strong> keep the next useful concept within reach.</p></div></div><Link href="/quiz" className="btn-primary mt-9">Try a practice quiz <ArrowRight className="h-4 w-4" /></Link></motion.div>
        </div></section>

        <section id="resources" className="bg-[#F8F9FC] py-24 lg:py-32"><div className="mx-auto max-w-[1340px] px-5 lg:px-9"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><SectionKicker>Your study ecosystem</SectionKicker><h2 className="font-display text-5xl tracking-[-.055em] lg:text-6xl">Resources that stay organized.</h2></div><Link href="/resources" className="btn-quiet">Open resources <ArrowRight className="h-4 w-4" /></Link></div><div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{resources.map((resource, index) => <motion.article key={resource.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }} className={`resource-card tone-${resource.tone}`}><BookOpen className="h-5 w-5" /><p className="mt-10 text-xs font-bold uppercase tracking-[.12em] text-[#53617A]">{resource.count}</p><h3 className="mt-2 font-display text-2xl tracking-[-.035em]">{resource.title}</h3><p className="mt-3 text-sm leading-6 text-[#65728A]">{resource.detail}</p></motion.article>)}</div></div></section>

        <section id="faq" className="bg-white py-24 lg:py-32"><div className="mx-auto grid max-w-[1100px] gap-10 px-5 lg:grid-cols-[.72fr_1.28fr] lg:px-9"><div><SectionKicker>Frequently asked questions</SectionKicker><h2 className="font-display text-5xl leading-[1.02] tracking-[-.055em]">Learning should feel clear from the first click.</h2><p className="mt-6 text-[#65728A]">This prototype keeps all functionality local and ready for your future backend.</p></div><div className="divide-y divide-[#E4E9F4] border-y border-[#E4E9F4]">{faq.map(([question, answer], index) => <div key={question}><button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex w-full items-center justify-between gap-5 py-5 text-left font-bold text-[#18233B]" aria-expanded={openFaq === index}>{question}<ChevronDown className={`h-5 w-5 shrink-0 text-[#3B63E8] transition-transform ${openFaq === index ? "rotate-180" : ""}`} /></button><AnimatePresence initial={false}>{openFaq === index && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden"><p className="max-w-xl pb-5 leading-7 text-[#65728A]">{answer}</p></motion.div>}</AnimatePresence></div>)}</div></div></section>
      </main>
      <footer className="border-t border-[#E4E9F4] bg-[#F8F9FC]"><div className="mx-auto flex max-w-[1340px] flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-9"><Brand /><p className="text-sm text-[#65728A]">A frontend-only learning prototype built around thoughtful practice.</p><Link href="/dashboard" className="text-sm font-bold text-[#3B63E8]">Open learning workspace</Link></div></footer>
    </div>
  );
}
