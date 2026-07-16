import type { Profile, SectionKey } from "@/lib/profile";
import { dateRange } from "@/lib/profile";
import { Mail, Phone, MapPin, Globe, Github, Linkedin } from "lucide-react";

export function NavySidebar({ p, order }: { p: Profile; order?: SectionKey[] }) {
  const skills = p.skills?.technical ?? {};
  return (
    <div className="cv-page grid" style={{ gridTemplateColumns: "68mm 1fr" }}>
      {/* Sidebar 30% */}
      <aside className="bg-cv-navy text-cv-navy-foreground p-5 flex flex-col gap-4">
        {p.profile.photo_url && (
          <div className="mx-auto w-28 h-28 rounded-full overflow-hidden ring-4 ring-white/90 shrink-0">
            <img src={p.profile.photo_url} alt={p.profile.full_name} className="w-full h-full object-cover" />
          </div>
        )}

        <Section title="CONTACT">
          <ul className="space-y-1.5 text-[10pt] leading-relaxed">
            {p.contact?.phone && <Row icon={<Phone size={11} />}>{p.contact.phone}</Row>}
            {p.contact?.email && <Row icon={<Mail size={11} />}>{p.contact.email}</Row>}
            {p.contact?.address && (
              <Row icon={<MapPin size={11} />}>
                {[p.contact.address.street, p.contact.address.city, p.contact.address.country]
                  .filter(Boolean).join(", ")}
              </Row>
            )}
            {p.contact?.linkedin && <Row icon={<Linkedin size={11} />}>{p.contact.linkedin}</Row>}
            {p.contact?.github && <Row icon={<Github size={11} />}>{p.contact.github}</Row>}
            {p.contact?.portfolio && <Row icon={<Globe size={11} />}>{p.contact.portfolio}</Row>}
          </ul>
        </Section>

        <Section title="COMPÉTENCES">
          <div className="space-y-2 text-[10pt]">
            {Object.entries(skills).map(([cat, arr]) => (
              <div key={cat}>
                <div className="uppercase tracking-wider text-[9pt] text-white font-bold mb-0.5">
                  {cat.replace(/_/g, " ")}
                </div>
                <ul className="space-y-0.5">
                  {arr.map((s) => (
                    <li key={s} className="leading-snug">• {s}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {p.skills?.languages?.length > 0 && (
          <Section title="LANGUES">
            <ul className="space-y-1 text-[10pt]">
              {p.skills.languages.map((l) => (
                <li key={l.language} className="flex justify-between">
                  <span>{l.language}</span>
                  <span className="opacity-80">{l.cefr ?? l.level}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {p.skills?.soft_skills?.length > 0 && (
          <Section title="SOFT SKILLS">
            <ul className="text-[10pt] space-y-1 list-disc list-inside">
              {p.skills.soft_skills.slice(0, 6).map((s) => <li key={s}>{s}</li>)}
            </ul>
          </Section>
        )}
      </aside>


      {/* Main */}
      <main className="p-7 pr-8">
        <header className="mb-5">
          <h1 className="text-[30px] font-bold leading-none">
            <span className="text-cv-muted font-light">{p.profile.full_name.split(" ")[0]}</span>{" "}
            <span className="text-cv-navy">{p.profile.full_name.split(" ").slice(1).join(" ")}</span>
          </h1>
          <div className="text-cv-muted uppercase tracking-[0.25em] text-[10.5pt] mt-2 font-semibold">
            {p.profile.current_role}
          </div>
          <div className="w-14 h-[3px] bg-cv-navy mt-3" />
        </header>

        {p.profile.professional_summary && (
          <MainSection title="PROFIL">
            <p className="text-[10.5pt] leading-relaxed text-cv-ink/90 text-justify">
              {p.profile.professional_summary}
            </p>
          </MainSection>
        )}

        {p.professional_experience?.length > 0 && (
          <MainSection title="EXPÉRIENCE PROFESSIONNELLE">
            <div className="space-y-3.5">
              {p.professional_experience.map((e, i) => (
                <ExperienceBlock key={i} e={e} />
              ))}
            </div>
          </MainSection>
        )}

        {p.education?.length > 0 && (
          <MainSection title="FORMATION">
            <div className="space-y-2.5">
              {p.education.map((e, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline gap-3">
                    <div className="font-semibold text-[11pt]">{e.degree}</div>
                    <div className="text-[10pt] text-cv-muted whitespace-nowrap">
                      {dateRange(e.start_date, e.end_date, e.status)}
                    </div>
                  </div>
                  <div className="text-[10.5pt] text-cv-muted italic">
                    {e.institution}{e.location ? ` — ${e.location}` : ""}
                    {e.average_score ? ` · Moyenne ${e.average_score}` : ""}
                  </div>
                  {e.description && (
                    <p className="text-[10pt] mt-1 text-cv-ink/85">{e.description}</p>
                  )}
                </div>
              ))}
            </div>
          </MainSection>
        )}

        {p.projects?.length > 0 && (
          <MainSection title="PROJETS">
            <div className="space-y-2.5">
              {p.projects.slice(0, 3).map((pr, i) => (
                <div key={i}>
                  <div className="font-semibold text-[11pt]">
                    {pr.name}{pr.type ? <span className="text-cv-muted font-normal"> — {pr.type}</span> : null}
                  </div>
                  {pr.description && (
                    <p className="text-[10pt] text-cv-ink/85 mt-0.5">{pr.description}</p>
                  )}
                </div>
              ))}
            </div>
          </MainSection>
        )}

        {p.certifications?.length > 0 && (
          <MainSection title="CERTIFICATIONS">
            <ul className="space-y-1">
              {p.certifications.map((c, i) => (
                <li key={i} className="text-[10.5pt]">
                  <span className="font-semibold">{c.name}</span>
                  <span className="text-cv-muted"> — {c.provider}{c.status ? ` (${c.status})` : ""}</span>
                </li>
              ))}
            </ul>
          </MainSection>
        )}
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-[11pt] font-bold tracking-[0.2em] mb-2 border-b border-white/40 pb-1 text-white">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Row({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 break-all">
      <span className="mt-1 shrink-0 opacity-90">{icon}</span>
      <span>{children}</span>
    </li>
  );
}

function MainSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-4">
      <h2 className="text-cv-navy font-bold text-[12pt] tracking-[0.18em] pb-1 mb-2 border-b-2 border-cv-navy">
        {title}
      </h2>
      {children}
    </section>
  );
}


function ExperienceBlock({ e }: { e: Profile["professional_experience"][number] }) {
  return (
    <div>
      <div className="flex justify-between items-baseline gap-3">
        <div>
          <div className="font-semibold text-[11pt]">{e.role}</div>
          <div className="text-cv-navy text-[10.5pt] italic">
            {e.company}{e.location ? ` — ${e.location}` : ""}
          </div>
        </div>
        <div className="text-[10pt] text-cv-muted whitespace-nowrap">
          {dateRange(e.start_date, e.end_date)}
        </div>
      </div>
      {e.project_description && (
        <p className="text-[10pt] mt-1 text-cv-ink/85">
          <span className="font-medium">{e.project ? `${e.project}. ` : ""}</span>
          {e.project_description}
        </p>
      )}
      {e.achievements?.length ? (
        <ul className="mt-1 space-y-0.5 text-[10pt] list-disc list-outside pl-4">
          {e.achievements.map((a, i) => <li key={i}>{a}</li>)}
        </ul>
      ) : null}
      {e.technologies?.length ? (
        <div className="text-[10pt] text-cv-muted mt-1">
          <span className="font-semibold">Stack:</span> {e.technologies.join(" · ")}
        </div>
      ) : null}
    </div>
  );
}
