import { useRef, useState } from "react";
import { Upload, Loader2, CheckCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onSuccess: (url: string) => void;
  accept?: string;
  label?: string;
}

type UploadState = "idle" | "uploading" | "done" | "error";

export default function ImageUploadButton({ onSuccess, accept = "image/*", label = "Upload from device" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleFile(file: File) {
    if (!file) return;
    setState("uploading");
    setProgress(20);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      setProgress(50);
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Upload failed");
      }

      const { url } = await res.json();
      setProgress(100);
      onSuccess(url);
      setState("done");
      setTimeout(() => setState("idle"), 2000);
    } catch (err: any) {
      setErrorMsg(err.message ?? "Upload failed");
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = ""; }}
      />

      <motion.button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={state === "uploading"}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center gap-2 px-3 py-2 border text-xs tracking-wide transition-all ${
          state === "done"
            ? "border-green-500 text-green-600 bg-green-50 dark:bg-green-950/30"
            : state === "error"
            ? "border-destructive text-destructive bg-destructive/5"
            : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40 bg-background"
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {state === "uploading" ? (
            <motion.div key="loading" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </motion.div>
          ) : state === "done" ? (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <CheckCircle className="w-3.5 h-3.5" />
            </motion.div>
          ) : state === "error" ? (
            <motion.div key="error" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <X className="w-3.5 h-3.5" />
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <Upload className="w-3.5 h-3.5" />
            </motion.div>
          )}
        </AnimatePresence>

        <span>
          {state === "uploading" ? `Uploading… ${progress}%`
            : state === "done" ? "Uploaded!"
            : state === "error" ? errorMsg
            : label}
        </span>
      </motion.button>

      <AnimatePresence>
        {state === "uploading" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "3px" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full bg-muted overflow-hidden rounded-full"
          >
            <motion.div
              className="h-full bg-accent"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
