import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export type EditorStyle = {
  accentNavy: "navy" | "slate" | "teal" | "burgundy" | "forest";
  accentColor: "copper" | "gold" | "rose" | "sky";
  font: "serif" | "sans" | "modern";
  spacing: "compact" | "normal" | "relaxed";
};

export const DEFAULT_STYLE: EditorStyle = {
  accentNavy: "navy",
  accentColor: "copper",
  font: "serif",
  spacing: "normal",
};

export function StyleControls({ style, setStyle }: { style: EditorStyle; setStyle: (s: EditorStyle) => void }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Couleur principale</Label>
        <div className="grid grid-cols-5 gap-2">
          {(["navy", "slate", "teal", "burgundy", "forest"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setStyle({ ...style, accentNavy: c })}
              className={`h-8 rounded-md border-2 transition ${style.accentNavy === c ? "border-foreground ring-1 ring-foreground" : "border-transparent"}`}
              style={{ background: NAVY_PREVIEW[c] }}
              aria-label={c}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Accent</Label>
        <div className="grid grid-cols-4 gap-2">
          {(["copper", "gold", "rose", "sky"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setStyle({ ...style, accentColor: c })}
              className={`h-8 rounded-md border-2 transition ${style.accentColor === c ? "border-foreground ring-1 ring-foreground" : "border-transparent"}`}
              style={{ background: ACCENT_PREVIEW[c] }}
              aria-label={c}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Typographie</Label>
        <div className="grid grid-cols-3 gap-2">
          {(["serif", "sans", "modern"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStyle({ ...style, font: f })}
              className={`text-xs rounded-md border px-2 py-2 transition ${
                style.font === f ? "border-cv-navy bg-cv-navy/5 font-semibold" : "border-border hover:border-cv-navy/50"
              }`}
              style={{ fontFamily: FONT_PREVIEW[f] }}
            >
              {f === "serif" ? "Serif" : f === "sans" ? "Sans" : "Moderne"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Espacement</Label>
        <div className="px-1">
          <Slider
            value={[SPACING_INDEX[style.spacing]]}
            min={0}
            max={2}
            step={1}
            onValueChange={([v]) => setStyle({ ...style, spacing: SPACING_KEYS[v] })}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Compact</span>
          <span>Normal</span>
          <span>Aéré</span>
        </div>
      </div>
    </div>
  );
}

const NAVY_PREVIEW: Record<EditorStyle["accentNavy"], string> = {
  navy: "#1e2a4a",
  slate: "#334155",
  teal: "#115e59",
  burgundy: "#581c87",
  forest: "#14532d",
};

const ACCENT_PREVIEW: Record<EditorStyle["accentColor"], string> = {
  copper: "#b5651d",
  gold: "#c59a3f",
  rose: "#be123c",
  sky: "#0369a1",
};

const FONT_PREVIEW: Record<EditorStyle["font"], string> = {
  serif: "'Fraunces', Georgia, serif",
  sans: "'Inter', system-ui, sans-serif",
  modern: "'Space Grotesk', system-ui, sans-serif",
};

const SPACING_INDEX = { compact: 0, normal: 1, relaxed: 2 };
const SPACING_KEYS: EditorStyle["spacing"][] = ["compact", "normal", "relaxed"];
