import type { Profile, SectionKey } from "@/lib/profile";
import { dateRange } from "@/lib/profile";

export function HeaderTimeline({ p, order }: { p: Profile; order?: SectionKey[] }) {
  return (
    <div className="cv-page">
      {/* Header banner */}
      <header className="bg-cv-navy text-cv-navy-foreground px-10 py-7 flex items-center gap-6">
        {p.profile.photo_url && (
          <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white/90 shrink-0">
            <img src={p.profile.photo_url} alt={p.profile.full_name} className="w-full h-full object-cover" />
          </div>
        )}
        <div>
          <h1 className="text-[34px] font-bold uppercase tracking-wide leading-none">
            {p.profile.full_name}
          </h1>
          <div className="mt-2 uppercase tracking-[0.35em] text-[12px] opacity-90">
            {p.profile.current_role}
          </div>
          <div className="mt-3 text-[11px] opacity-90 flex flex-wrap gap-x-4 gap-y-1">
            {p.contact?.phone && <span>{p.contact.phone}</span>}
            {p.contact?.email && <span>{p.contact.email}</span>}
            {p.contact?.address?.city && (
              <span>{p.contact.address.city}, {p.contact.address.country}</span>
            )}
          </div>
        </div>
      </header>

      <div className="px-10 py-8">
        {p.profile.professional_summary && (
          <Block title="PROFIL">
            <p className="text-[11.5px] leading-relaxed text-justify">
              {p.profile.professional_summary}
            </p>
          </Block>
        )}

        {p.professional_experience?.length > 0 && (
          <Block title="EXPÉRIENCE PROFESSIONNELLE">
            <div className="relative pl-6 border-l-2 border-cv-navy space-y-4">
              {p.professional_experience.map((e, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full bg-cv-navy" />
                  <div className="flex justify-between items-baseline gap-3">
                    <div className="font-semibold text-[12.5px]">{e.company}</div>
                    <div className="text-[10.5px] text-cv-muted">
                      {dateRange(e.start_date, e.end_date)}
                    </div>
                  </div>
                  <div className="italic text-[11.5px] text-cv-muted">{e.role}</div>
                  {e.project_description && (
                    <p className="text-[11px] mt-1">{e.project_description}</p>
                  )}
                  {e.achievements?.length ? (
                    <ul className="mt-1 space-y-0.5 text-[11px] list-disc list-outside pl-4">
                      {e.achievements.map((a, j) => <li key={j}>{a}</li>)}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </Block>
        )}

        {p.education?.length > 0 && (
          <Block title="FORMATION">
            <div className="relative pl-6 border-l-2 border-cv-navy space-y-3">
              {p.education.map((e, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full bg-cv-navy" />
                  <div className="flex justify-between items-baseline gap-3">
                    <div className="font-semibold text-[12px]">{e.degree}</div>
                    <div className="text-[10.5px] text-cv-muted">
                      {dateRange(e.start_date, e.end_date, e.status)}
                    </div>
                  </div>
                  <div className="italic text-[11px] text-cv-muted">
                    {e.institution}{e.average_score ? ` · Moyenne ${e.average_score}` : ""}
                  </div>
                </div>
              ))}
            </div>
          </Block>
        )}

        <div className="grid grid-cols-2 gap-8">
          {p.skills?.technical && (
            <Block title="COMPÉTENCES">
              <div className="space-y-2 text-[11px]">
                {Object.entries(p.skills.technical).map(([cat, arr]) => (
                  <div key={cat}>
                    <span className="font-semibold text-cv-navy uppercase text-[10px] tracking-wider">
                      {cat.replace(/_/g, " ")}: </span>
                    <span>{arr.join(", ")}</span>
                  </div>
                ))}
              </div>
            </Block>
          )}
          {p.skills?.languages?.length > 0 && (
            <Block title="LANGUES">
              <ul className="text-[11.5px] space-y-1">
                {p.skills.languages.map((l) => (
                  <li key={l.language} className="flex justify-between">
                    <span className="font-semibold">{l.language}</span>
                    <span className="text-cv-muted">{l.cefr ?? l.level}</span>
                  </li>
                ))}
              </ul>
            </Block>
          )}
        </div>
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h2 className="text-cv-navy font-bold text-[13px] tracking-[0.25em] pb-1 mb-3 border-b-2 border-cv-navy">
        {title}
      </h2>
      {children}
    </section>
  );
}
