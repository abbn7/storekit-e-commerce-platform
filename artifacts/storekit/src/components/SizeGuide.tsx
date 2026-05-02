import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Ruler } from "lucide-react";
import { luxury } from "@/lib/animations";

const SIZES = [
  { label: "XS", eu: "32–34", uk: "6–8", us: "2–4", bust: "82–86", waist: "63–67", hips: "87–91" },
  { label: "S",  eu: "36–38", uk: "10–12", us: "6–8", bust: "88–92", waist: "69–73", hips: "93–97" },
  { label: "M",  eu: "40–42", uk: "14–16", us: "10–12", bust: "94–98", waist: "75–80", hips: "99–103" },
  { label: "L",  eu: "44–46", uk: "18–20", us: "14–16", bust: "100–106", waist: "82–87", hips: "105–111" },
  { label: "XL", eu: "48–50", uk: "22–24", us: "18–20", bust: "108–114", waist: "89–95", hips: "113–119" },
];

export default function SizeGuide() {
  const [open, setOpen] = useState(false);
  const [unit, setUnit] = useState<"cm" | "in">("cm");

  function convert(cm: string) {
    if (unit === "cm") return cm;
    const [lo, hi] = cm.split("–").map(Number);
    const toIn = (n: number) => Math.round(n / 2.54 * 10) / 10;
    return hi ? `${toIn(lo)}–${toIn(hi)}` : String(toIn(lo));
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
      >
        <Ruler className="w-3.5 h-3.5" />
        Size Guide
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-foreground/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ duration: 0.4, ease: luxury }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-1/2 sm:-translate-y-1/2 sm:w-[640px] z-[71] bg-background border border-border shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">Fit Guide</p>
                  <h2 className="font-display text-2xl font-light" style={{ fontFamily: "var(--font-display)" }}>
                    Size Chart
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  {/* Unit toggle */}
                  <div className="flex border border-border text-xs overflow-hidden">
                    {(["cm", "in"] as const).map((u) => (
                      <button
                        key={u}
                        onClick={() => setUnit(u)}
                        className={`px-3 py-1.5 transition-colors ${unit === u ? "bg-foreground text-background" : "hover:bg-muted"}`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-muted transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Size table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {["Size", "EU", "UK", "US", `Bust (${unit})`, `Waist (${unit})`, `Hips (${unit})`].map((h) => (
                          <th key={h} className="text-left text-[11px] text-muted-foreground tracking-wide py-2.5 pr-4 font-normal">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {SIZES.map((row, i) => (
                        <motion.tr
                          key={row.label}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04, duration: 0.3 }}
                          className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-3 pr-4 font-medium text-sm">{row.label}</td>
                          <td className="py-3 pr-4 text-muted-foreground text-xs">{row.eu}</td>
                          <td className="py-3 pr-4 text-muted-foreground text-xs">{row.uk}</td>
                          <td className="py-3 pr-4 text-muted-foreground text-xs">{row.us}</td>
                          <td className="py-3 pr-4 text-xs">{convert(row.bust)}</td>
                          <td className="py-3 pr-4 text-xs">{convert(row.waist)}</td>
                          <td className="py-3 pr-4 text-xs">{convert(row.hips)}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* How to measure */}
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">How to Measure</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Bust", desc: "Measure around the fullest part of your chest, keeping the tape parallel to the floor." },
                      { label: "Waist", desc: "Measure around your natural waistline, the narrowest part of your torso." },
                      { label: "Hips", desc: "Measure around the fullest part of your hips, keeping the tape parallel to the floor." },
                    ].map((item) => (
                      <div key={item.label} className="space-y-1.5">
                        <p className="text-xs font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="mt-4 text-xs text-muted-foreground/60">
                  All measurements are in {unit}. If you're between sizes, we recommend sizing up for a relaxed fit.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
