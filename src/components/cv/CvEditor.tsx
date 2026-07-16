import { useCallback } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  emptyCertification,
  emptyEducation,
  emptyExperience,
  emptyLanguage,
  emptyProject,
  type Profile,
} from "@/lib/profile";
import { toast } from "sonner";

export type ProfileUpdater = (fn: (p: Profile) => Profile) => void;

export function CvEditor({ profile, update }: { profile: Profile; update: ProfileUpdater }) {
  const set = useCallback(
    (path: string, value: unknown) => {
      update((p) => {
        const next = structuredClone(p);
        const keys = path.split(".");
        let cur: any = next;
        for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
        cur[keys[keys.length - 1]] = value;
        return next;
      });
    },
    [update],
  );

  return (
    <div className="space-y-6">
      <Group title="Identité & contact">
        <Field label="Nom complet" value={profile.profile.full_name} onChange={(v) => set("profile.full_name", v)} />
        <Field label="Titre" value={profile.profile.current_role ?? ""} onChange={(v) => set("profile.current_role", v)} />
        <Area label="Résumé professionnel" value={profile.profile.professional_summary ?? ""} onChange={(v) => set("profile.professional_summary", v)} />
        <Field label="Téléphone" value={profile.contact.phone ?? ""} onChange={(v) => set("contact.phone", v)} />
        <Field label="Email" value={profile.contact.email ?? ""} onChange={(v) => set("contact.email", v)} />
        <Field label="LinkedIn" value={profile.contact.linkedin ?? ""} onChange={(v) => set("contact.linkedin", v)} />
        <Field label="GitHub" value={profile.contact.github ?? ""} onChange={(v) => set("contact.github", v)} />
        <Field label="Portfolio" value={profile.contact.portfolio ?? ""} onChange={(v) => set("contact.portfolio", v)} />
      </Group>

      <ListGroup
        title="Expériences"
        items={profile.professional_experience ?? []}
        render={(e, i) => (
          <div className="space-y-2">
            <Field label="Poste" value={e.role} onChange={(v) => set(`professional_experience.${i}.role`, v)} />
            <div className="grid grid-cols-2 gap-2">
              <Field label="Entreprise" value={e.company} onChange={(v) => set(`professional_experience.${i}.company`, v)} />
              <Field label="Lieu" value={e.location ?? ""} onChange={(v) => set(`professional_experience.${i}.location`, v)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Début (YYYY-MM)" value={e.start_date ?? ""} onChange={(v) => set(`professional_experience.${i}.start_date`, v)} />
              <Field label="Fin (YYYY-MM)" value={e.end_date ?? ""} onChange={(v) => set(`professional_experience.${i}.end_date`, v)} />
            </div>
            <Area label="Description / projet" value={e.project_description ?? ""} onChange={(v) => set(`professional_experience.${i}.project_description`, v)} />
            <Area
              label="Réalisations (une ligne par point, 3 à 4 recommandés)"
              value={(e.achievements ?? []).join("\n")}
              onChange={(v) => set(`professional_experience.${i}.achievements`, v.split("\n").map((s) => s.trim()).filter(Boolean))}
            />
            <Field label="Technologies (séparées par des virgules)" value={e.technologies?.join(", ") ?? ""} onChange={(v) => set(`professional_experience.${i}.technologies`, v.split(",").map((s) => s.trim()).filter(Boolean))} />

          </div>
        )}
        onAdd={() => update((p) => ({ ...p, professional_experience: [...(p.professional_experience ?? []), emptyExperience()] }))}
        onRemove={(i) => update((p) => ({ ...p, professional_experience: p.professional_experience.filter((_, idx) => idx !== i) }))}
      />

      <ListGroup
        title="Formation"
        items={profile.education ?? []}
        render={(e, i) => (
          <div className="space-y-2">
            <Field label="Diplôme" value={e.degree} onChange={(v) => set(`education.${i}.degree`, v)} />
            <Field label="Établissement" value={e.institution} onChange={(v) => set(`education.${i}.institution`, v)} />
            <Field label="Lieu" value={e.location ?? ""} onChange={(v) => set(`education.${i}.location`, v)} />
            <div className="grid grid-cols-2 gap-2">
              <Field label="Début" value={e.start_date ?? ""} onChange={(v) => set(`education.${i}.start_date`, v)} />
              <Field label="Fin" value={e.end_date ?? ""} onChange={(v) => set(`education.${i}.end_date`, v)} />
            </div>
            <Field label="Mention / moyenne" value={e.average_score ?? ""} onChange={(v) => set(`education.${i}.average_score`, v)} />
            <Area label="Description" value={e.description ?? ""} onChange={(v) => set(`education.${i}.description`, v)} />
          </div>
        )}
        onAdd={() => update((p) => ({ ...p, education: [...(p.education ?? []), emptyEducation()] }))}
        onRemove={(i) => update((p) => ({ ...p, education: p.education.filter((_, idx) => idx !== i) }))}
      />

      <ListGroup
        title="Projets"
        items={profile.projects ?? []}
        render={(e, i) => (
          <div className="space-y-2">
            <Field label="Nom" value={e.name} onChange={(v) => set(`projects.${i}.name`, v)} />
            <Field label="Type" value={e.type ?? ""} onChange={(v) => set(`projects.${i}.type`, v)} />
            <Area label="Description" value={e.description ?? ""} onChange={(v) => set(`projects.${i}.description`, v)} />
          </div>
        )}
        onAdd={() => update((p) => ({ ...p, projects: [...(p.projects ?? []), emptyProject()] }))}
        onRemove={(i) => update((p) => ({ ...p, projects: p.projects.filter((_, idx) => idx !== i) }))}
      />

      <ListGroup
        title="Certifications"
        items={profile.certifications ?? []}
        render={(e, i) => (
          <div className="space-y-2">
            <Field label="Nom" value={e.name} onChange={(v) => set(`certifications.${i}.name`, v)} />
            <Field label="Organisme" value={e.provider ?? ""} onChange={(v) => set(`certifications.${i}.provider`, v)} />
            <Field label="Statut" value={e.status ?? ""} onChange={(v) => set(`certifications.${i}.status`, v)} />
          </div>
        )}
        onAdd={() => update((p) => ({ ...p, certifications: [...(p.certifications ?? []), emptyCertification()] }))}
        onRemove={(i) => update((p) => ({ ...p, certifications: p.certifications.filter((_, idx) => idx !== i) }))}
      />

      <Group title="Compétences techniques">
        {Object.entries(profile.skills?.technical ?? {}).map(([cat, arr], i) => (
          <div key={cat} className="space-y-1 mb-3">
            <div className="flex items-center gap-2">
              <Input
                value={cat}
                onChange={(e) => update((p) => {
                  const next = structuredClone(p);
                  const keys = Object.keys(next.skills.technical);
                  const newKey = e.target.value || cat;
                  if (newKey !== cat) {
                    const entries = Object.entries(next.skills.technical);
                    entries[i] = [newKey, entries[i][1]];
                    next.skills.technical = Object.fromEntries(entries);
                  }
                  return next;
                })}
                className="h-8 text-xs"
                placeholder="Catégorie"
              />
              <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => update((p) => {
                const next = structuredClone(p);
                const entries = Object.entries(next.skills.technical).filter((_, idx) => idx !== i);
                next.skills.technical = Object.fromEntries(entries);
                return next;
              })}>
                <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </div>
            <Textarea
              value={arr.join(", ")}
              onChange={(e) => update((p) => {
                const next = structuredClone(p);
                const keys = Object.keys(next.skills.technical);
                next.skills.technical[keys[i]] = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                return next;
              })}
              className="min-h-[52px] text-xs"
              placeholder="Compétences séparées par des virgules"
            />
          </div>
        ))}
        <Button variant="outline" size="sm" className="w-full" onClick={() => update((p) => {
          const next = structuredClone(p);
          next.skills.technical = { ...next.skills.technical, "Nouvelle catégorie": [] };
          return next;
        })}>
          <Plus className="w-4 h-4 mr-1.5" /> Ajouter une catégorie
        </Button>
      </Group>

      <ListGroup
        title="Langues"
        items={profile.skills?.languages ?? []}
        render={(e, i) => (
          <div className="grid grid-cols-2 gap-2">
            <Field label="Langue" value={e.language} onChange={(v) => set(`skills.languages.${i}.language`, v)} />
            <Field label="Niveau" value={e.cefr ?? e.level ?? ""} onChange={(v) => set(`skills.languages.${i}.cefr`, v)} />
          </div>
        )}
        onAdd={() => update((p) => ({ ...p, skills: { ...p.skills, languages: [...(p.skills?.languages ?? []), emptyLanguage()] } }))}
        onRemove={(i) => update((p) => ({ ...p, skills: { ...p.skills, languages: p.skills.languages.filter((_, idx) => idx !== i) } }))}
      />

      <Group title="Soft skills">
        <Textarea
          value={(profile.skills?.soft_skills ?? []).join(", ")}
          onChange={(e) => update((p) => {
            const next = structuredClone(p);
            next.skills.soft_skills = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
            return next;
          })}
          className="min-h-[60px] text-xs"
          placeholder="Séparées par des virgules"
        />
      </Group>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border rounded-lg p-3 bg-card">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-8 text-xs" />
    </div>
  );
}

function Area({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} className="min-h-[60px] text-xs" />
    </div>
  );
}

function ListGroup<T>({
  title,
  items,
  render,
  onAdd,
  onRemove,
}: {
  title: string;
  items: T[];
  render: (item: T, idx: number) => React.ReactNode;
  onAdd: () => void;
  onRemove: (idx: number) => void;
}) {
  return (
    <section className="border rounded-lg p-3 bg-card">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{title}</h3>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="border rounded-md p-2.5 bg-background/50 relative group">
            <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { onRemove(i); toast.success("Élément supprimé"); }}>
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </Button>
            </div>
            <div className="pr-8">{render(item, i)}</div>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" className="w-full mt-3" onClick={onAdd}>
        <Plus className="w-4 h-4 mr-1.5" /> Ajouter
      </Button>
    </section>
  );
}
