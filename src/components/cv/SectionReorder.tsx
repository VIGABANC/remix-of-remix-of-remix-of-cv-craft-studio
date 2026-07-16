import { GripVertical } from "lucide-react";
import { DEFAULT_SECTION_ORDER, type Profile, type SectionKey } from "@/lib/profile";

const SECTION_LABELS: Record<SectionKey, string> = {
  summary: "Résumé",
  experience: "Expérience",
  education: "Formation",
  projects: "Projets",
  certifications: "Certifications",
  skills: "Compétences",
  languages: "Langues",
};

export function SectionReorder({ order, setOrder }: { order: SectionKey[]; setOrder: (o: SectionKey[]) => void }) {
  const move = (from: number, to: number) => {
    const next = [...order];
    const [removed] = next.splice(from, 1);
    next.splice(to, 0, removed);
    setOrder(next);
  };

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-muted-foreground">
        Réorganisez l'ordre des grandes sections du CV.
      </p>
      {order.map((key, i) => (
        <div
          key={key}
          className="flex items-center gap-2 rounded-md border bg-card px-2 py-1.5 text-xs"
        >
          <button
            className="text-muted-foreground hover:text-foreground disabled:opacity-30"
            disabled={i === 0}
            onClick={() => move(i, i - 1)}
            aria-label="Monter"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <span className="font-medium flex-1">{SECTION_LABELS[key]}</span>
          <button
            className="text-muted-foreground hover:text-foreground disabled:opacity-30"
            disabled={i === order.length - 1}
            onClick={() => move(i, i + 1)}
            aria-label="Descendre"
          >
            <GripVertical className="w-4 h-4 rotate-180" />
          </button>
        </div>
      ))}
      <button
        className="text-[11px] text-cv-navy hover:underline"
        onClick={() => setOrder(DEFAULT_SECTION_ORDER)}
      >
        Réinitialiser l'ordre
      </button>
    </div>
  );
}
