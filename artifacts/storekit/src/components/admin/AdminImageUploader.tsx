import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Upload, X, Star, Loader2, GripVertical, Link as LinkIcon, ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ImageField {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
}

interface Props {
  images: ImageField[];
  onChange: (images: ImageField[]) => void;
}

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
  error?: string;
}

let idCounter = 1000;
function uid() { return `img-${Date.now()}-${idCounter++}`; }

export default function AdminImageUploader({ images, onChange }: Props) {
  const [draggingOver, setDraggingOver] = useState(false);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/uploads", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Upload failed");
    const { url } = await res.json();
    return url;
  }, []);

  async function handleFiles(files: FileList | File[]) {
    const validFiles = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (!validFiles.length) return;

    const newUploading: UploadingFile[] = validFiles.map(f => ({
      id: uid(), name: f.name, progress: 10,
    }));
    setUploading(prev => [...prev, ...newUploading]);

    await Promise.all(validFiles.map(async (file, i) => {
      const fileId = newUploading[i].id;
      try {
        setUploading(prev => prev.map(u => u.id === fileId ? { ...u, progress: 40 } : u));
        const url = await uploadFile(file);
        setUploading(prev => prev.map(u => u.id === fileId ? { ...u, progress: 100 } : u));
        onChange([...images, {
          id: uid(),
          url,
          alt: file.name.replace(/\.[^.]+$/, ""),
          isPrimary: images.length === 0,
          sortOrder: images.length + i,
        }]);
        setTimeout(() => setUploading(prev => prev.filter(u => u.id !== fileId)), 800);
      } catch {
        setUploading(prev => prev.map(u => u.id === fileId ? { ...u, error: "Failed", progress: 0 } : u));
        setTimeout(() => setUploading(prev => prev.filter(u => u.id !== fileId)), 2500);
      }
    }));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDraggingOver(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  }

  function handleAddUrl() {
    const url = urlInput.trim();
    if (!url) return;
    onChange([...images, {
      id: uid(), url, alt: "", isPrimary: images.length === 0, sortOrder: images.length,
    }]);
    setUrlInput("");
    setShowUrlInput(false);
  }

  function setPrimary(id: string) {
    onChange(images.map(img => ({ ...img, isPrimary: img.id === id })));
  }

  function removeImage(id: string) {
    const filtered = images.filter(img => img.id !== id);
    const hasPrimary = filtered.some(img => img.isPrimary);
    onChange(filtered.map((img, i) => ({
      ...img,
      sortOrder: i,
      isPrimary: !hasPrimary && i === 0 ? true : img.isPrimary,
    })));
  }

  function updateAlt(id: string, alt: string) {
    onChange(images.map(img => img.id === id ? { ...img, alt } : img));
  }

  function handleReorder(newOrder: ImageField[]) {
    onChange(newOrder.map((img, i) => ({ ...img, sortOrder: i })));
  }

  return (
    <div className="space-y-4">

      {/* Drop Zone */}
      <motion.div
        onDragOver={e => { e.preventDefault(); setDraggingOver(true); }}
        onDragLeave={() => setDraggingOver(false)}
        onDrop={handleDrop}
        animate={{ borderColor: draggingOver ? "var(--foreground)" : "var(--border)", backgroundColor: draggingOver ? "var(--muted)" : "transparent" }}
        transition={{ duration: 0.2 }}
        className="border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => { if (e.target.files) handleFiles(e.target.files); e.target.value = ""; }}
        />
        <motion.div
          animate={{ scale: draggingOver ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center gap-3 pointer-events-none"
        >
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Upload className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Drop images here or click to upload</p>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP · Max 20MB each · Multiple files supported</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Actions row */}
      <div className="flex items-center gap-3">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 border border-border text-xs tracking-wide hover:border-foreground/50 transition-colors"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          Upload from device
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setShowUrlInput(v => !v)}
          className="flex items-center gap-2 px-4 py-2 border border-border text-xs tracking-wide hover:border-foreground/50 transition-colors"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          Add by URL
        </motion.button>
      </div>

      {/* URL input */}
      <AnimatePresence>
        {showUrlInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2 overflow-hidden"
          >
            <Input
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddUrl()}
              placeholder="https://example.com/image.jpg"
              className="text-xs"
              autoFocus
            />
            <button
              type="button"
              onClick={handleAddUrl}
              disabled={!urlInput.trim()}
              className="px-4 py-2 bg-foreground text-background text-xs tracking-wide hover:bg-foreground/85 transition-colors disabled:opacity-40"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => { setShowUrlInput(false); setUrlInput(""); }}
              className="px-3 py-2 border border-border text-xs hover:bg-muted transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active uploads */}
      <AnimatePresence>
        {uploading.map(u => (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border border-border p-3 space-y-2 overflow-hidden"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground truncate">{u.name}</span>
              {u.error
                ? <span className="text-destructive">{u.error}</span>
                : u.progress === 100
                ? <span className="text-green-600">Done ✓</span>
                : <Loader2 className="w-3 h-3 animate-spin" />
              }
            </div>
            {!u.error && (
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${u.progress === 100 ? "bg-green-500" : "bg-accent"}`}
                  animate={{ width: `${u.progress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Image list — drag to reorder */}
      {images.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            {images.length} image{images.length !== 1 ? "s" : ""} · Drag to reorder · Star = primary
          </Label>
          <Reorder.Group axis="y" values={images} onReorder={handleReorder} className="space-y-2">
            {images.map(img => (
              <Reorder.Item key={img.id} value={img}>
                <motion.div
                  layout
                  className={`flex gap-3 items-center p-3 border transition-colors ${img.isPrimary ? "border-accent/60 bg-accent/5" : "border-border bg-card"}`}
                >
                  {/* Drag handle */}
                  <div className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors flex-shrink-0">
                    <GripVertical className="w-4 h-4" />
                  </div>

                  {/* Preview */}
                  <div className="w-14 h-18 flex-shrink-0 bg-muted overflow-hidden" style={{ height: "72px" }}>
                    {img.url
                      ? <img src={img.url} alt={img.alt || "preview"} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.opacity = "0.3"; }} />
                      : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-4 h-4 text-muted-foreground/40" /></div>
                    }
                  </div>

                  {/* Alt text */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <input
                      type="text"
                      value={img.alt}
                      onChange={e => updateAlt(img.id, e.target.value)}
                      placeholder="Alt text (for SEO)"
                      className="w-full text-xs px-2 py-1.5 border border-border bg-background focus:outline-none focus:border-foreground/40 transition-colors"
                    />
                    <p className="text-[10px] text-muted-foreground truncate px-0.5">{img.url}</p>
                  </div>

                  {/* Primary star */}
                  <motion.button
                    type="button"
                    onClick={() => setPrimary(img.id)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    title={img.isPrimary ? "Primary image" : "Set as primary"}
                    className={`flex-shrink-0 p-1.5 transition-colors ${img.isPrimary ? "text-accent" : "text-muted-foreground/30 hover:text-muted-foreground"}`}
                  >
                    <Star className={`w-4 h-4 ${img.isPrimary ? "fill-accent" : ""}`} />
                  </motion.button>

                  {/* Remove */}
                  <motion.button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex-shrink-0 p-1.5 text-muted-foreground/40 hover:text-destructive transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      )}
    </div>
  );
}
