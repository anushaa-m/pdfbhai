import { motion } from "framer-motion";
import { CheckCircle2, FileText, Info, Sparkles, UploadCloud } from "lucide-react";
import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { AppShell } from "@/components/AppShell";
import { loadSession, saveSession, uploadPdf, type UploadResponse } from "@/lib/api";

export default function Upload() {
  const [, navigate] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [upload, setUpload] = useState<UploadResponse | undefined>(() => loadSession().upload);
  const [fileName, setFileName] = useState<string | null>(() => loadSession().upload?.filename || null);
  const [busy, setBusy] = useState(false);

  const receive = async (file?: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please choose a PDF file.");
      return;
    }
    setBusy(true);
    setFileName(file.name);
    try {
      const result = await uploadPdf(file);
      saveSession({ upload: result, questions: [], answers: {} });
      setUpload(result);
      toast.success("PDF uploaded", { description: `${result.num_pages} pages, ${result.num_chunks} chunks.` });
    } catch (error) {
      toast.error("Upload failed", { description: error instanceof Error ? error.message : "Backend did not accept the file." });
    } finally {
      setBusy(false);
    }
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => receive(event.target.files?.[0]);
  const onDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDragging(false);
    receive(event.dataTransfer.files?.[0]);
  };

  return <AppShell title="Create a Quiz From Your Notes" kicker="Backend upload">
    <div className="mx-auto max-w-3xl">
      <div className="stage-thread"><span className="stage-thread-active">01 Upload PDF</span><span>02 Generate MCQs</span><span>03 Practice</span></div>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-[#65728A]">Bring in one PDF. The backend will extract, chunk, embed, and prepare it for Qwen MCQ generation.</p>
      <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_.7fr]">
        <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop} className={`upload-zone study-sheet ${dragging ? "dragging" : ""}`} aria-label="Upload a PDF study document">
          <input ref={inputRef} onChange={onChange} type="file" accept="application/pdf" className="sr-only" disabled={busy} />
          <motion.span animate={dragging ? { y: -5, rotate: -4 } : { y: 0, rotate: 0 }} className="grid h-16 w-16 place-items-center rounded-2xl bg-[#EDF2FF] text-[#3B63E8]"><UploadCloud className="h-8 w-8" /></motion.span>
          <h2 className="mt-6 font-display text-3xl tracking-[-.045em]">{busy ? "Uploading to backend..." : "Drag & drop your PDF here"}</h2>
          <p className="mt-2 text-sm text-[#65728A]">or <span className="font-bold text-[#3B63E8]">browse files</span></p>
          <div className="mt-7 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#53617A] shadow-sm">PDF files only</div>
        </button>
        <aside className="context-note"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#EDF2FF] text-[#3B63E8]"><Sparkles className="h-5 w-5" /></span><h2 className="mt-5 font-display text-2xl tracking-[-.035em]">Connected to FastAPI.</h2><p className="mt-3 text-sm leading-6 text-[#65728A]">This screen posts the selected file to <code>/upload</code> and stores the returned PDF id for generation.</p><div className="mt-6 flex gap-2 rounded-xl bg-[#F8F9FC] p-3 text-xs leading-5 text-[#65728A]"><Info className="mt-0.5 h-4 w-4 shrink-0 text-[#3B63E8]" />Run the backend at http://localhost:8000 or set VITE_API_BASE_URL.</div></aside>
      </div>
      {fileName && <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-[1.5rem] border border-[#DDE5F4] bg-white p-5 shadow-[0_12px_35px_rgba(36,57,94,.05)]"><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#FFF1E6] text-[#C76A33]"><FileText className="h-6 w-6" /></span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-4"><p className="truncate text-sm font-bold text-[#18233B]">{fileName}</p>{upload && <span className="text-xs font-bold text-[#65728A]">{upload.num_pages} pages</span>}</div><p className="mt-2 text-xs text-[#65728A]">{busy ? "Sending to backend..." : upload ? `PDF id: ${upload.pdf_id}` : "Waiting for backend response"}</p></div>{upload && <CheckCircle2 className="h-6 w-6 shrink-0 text-[#21867E]" />}</div>{upload && <div className="mt-5 flex justify-end"><button onClick={() => navigate("/quiz-settings")} className="btn-primary">Generate MCQs</button></div>}</motion.div>}
    </div>
  </AppShell>;
}
