import type { Profile, SectionKey } from "@/lib/profile";
import { dateRange } from "@/lib/profile";

export function ModernMinimal({ p, order }: { p: Profile; order?: SectionKey[] }) {
  return (
    <div className="cv-page p-12" style={{ fontSize: "11.5px" }}>
      <header className="mb-8 flex items-start justify-between gap-6 pb-5 border-b border-cv-rule">
        <div>
          <h1 className="text-[38px] font-normal leading-none" style={{ letterSpacing: "-0.02em" }}>
            {p.profile.full_name}
          </h1>
          <div className="mt-3 text-cv-accent text-[13px]">
            {p.profile.current_role}
          </div>
        </div>
        <div className="text-right text-[10.5px] text-cv-muted space-y-0.5 shrink-0">
          {p.contact?.email && <div>{p.contact.email}</div>}
          {p.contact?.phone && <div>{p.contact.phone}</div>}
          {p.contact?.address?.city && (
            <div>{p.contact.address.city}, {p.contact.address.country}</div>
          )}
          {p.contact?.linkedin && <div>{p.contact.linkedin}</div>}
        </div>
      </header>

      {p.profile.professional_summary && (
        <p className="text-[12px] leading-relaxed mb-8 text-cv-ink/85 text-justify max-w-[95%]">
          {p.profile.professional_summary}
        </p>
      )}

      <Sec title="Expérience">
        {p.professional_experience?.map((e, i) => (
          <div key={i} className="mb-4 grid grid-cols-[110px_1fr] gap-6">
            <div className="text-[10.5px] text-cv-muted pt-0.5">
              {dateRange(e.start_date, e.end_date)}
            </div>
            <div>
              <div className="font-medium text-[12.5px]">
                {e.role} <span className="text-cv-muted">· {e.company}</span>
              </div>
              {e.project_description && <p className="mt-0.5 text-[11px]">{e.project_description}</p>}
              {e.achievements?.length ? (
                <ul className="mt-1 space-y-0.5 list-disc pl-4 text-[11px]">
                  {e.achievements.map((a, j) => <li key={j}>{a}</li>)}
                </ul>
              ) : null}
              {e.technologies?.length ? (
                <div className="text-[10.5px] text-cv-muted mt-1">
                  {e.technologies.join(" · ")}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </Sec>

      <Sec title="Formation">
        {p.education?.map((e, i) => (
          <div key={i} className="mb-2.5 grid grid-cols-[110px_1fr] gap-6">
            <div className="text-[10.5px] text-cv-muted pt-0.5">
              {dateRange(e.start_date, e.end_date, e.status)}
            </div>
            <div>
              <div className="font-medium text-[12px]">{e.degree}</div>
              <div className="text-cv-muted text-[11px]">
                {e.institution}{e.average_score ? ` · Moyenne ${e.average_score}` : ""}
              </div>
            </div>
          </div>
        ))}
      </Sec>

      <Sec title="Projets">
        {p.projects?.slice(0, 3).map((pr, i) => (
          <div key={i} className="mb-2">
            <div className="font-medium text-[12px]">{pr.name}
              {pr.type ? <span className="text-cv-muted font-normal"> — {pr.type}</span> : null}
            </div>
            {pr.description && <p className="text-[11px] mt-0.5">{pr.description}</p>}
          </div>
        ))}
      </Sec>

      <div className="grid grid-cols-2 gap-10">
        <Sec title="Compétences">
          <div className="space-y-1.5 text-[11px]">
            {Object.entries(p.skills?.technical ?? {}).map(([cat, arr]) => (
              <div key={cat}>
                <span className="text-cv-muted">{cat.replace(/_/g, " ")} · </span>
                {arr.join(", ")}
              </div>
            ))}
          </div>
        </Sec>
        <Sec title="Langues">
          <ul className="text-[11px] space-y-0.5">
            {p.skills?.languages?.map((l) => (
              <li key={l.language}>
                <span className="font-medium">{l.language}</span>
                <span className="text-cv-muted"> · {l.cefr ?? l.level}</span>
              </li>
            ))}
          </ul>
        </Sec>
      </div>
    </div>
  );
}

function Sec({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="text-[10px] uppercase tracking-[0.35em] text-cv-accent mb-3 font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}
