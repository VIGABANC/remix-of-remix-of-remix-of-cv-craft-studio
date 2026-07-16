import type { Profile, SectionKey } from "@/lib/profile";
import { dateRange } from "@/lib/profile";

// Strict single-column ATS layout — no icons, no columns, no colors on text.
export function AtsStrict({ p, order }: { p: Profile; order?: SectionKey[] }) {
  const sections = order ?? ["summary", "experience", "education", "projects", "certifications", "skills", "languages"];
  return (
    <div className="cv-page p-10" style={{ fontFamily: "Inter, Arial, sans-serif", fontSize: "11px", color: "#111" }}>
      <header className="mb-4">
        <h1 className="text-[22px] font-bold mb-0.5" style={{ fontFamily: "Inter, Arial, sans-serif" }}>
          {p.profile.full_name}
        </h1>
        <div className="text-[12px]">{p.profile.current_role}</div>
        <div className="text-[10.5px] mt-1">
          {[
            p.contact?.phone,
            p.contact?.email,
            p.contact?.address && [p.contact.address.city, p.contact.address.country].filter(Boolean).join(", "),
            p.contact?.linkedin,
            p.contact?.github,
          ].filter(Boolean).join(" | ")}
        </div>
      </header>

      {sections.map((key) => renderSection(key, p))}
    </div>
  );
}

function renderSection(key: SectionKey, p: Profile) {
  switch (key) {
    case "summary":
      return p.profile.professional_summary ? (
        <Ats key={key} title="RÉSUMÉ PROFESSIONNEL">
          <p>{p.profile.professional_summary}</p>
        </Ats>
      ) : null;
    case "experience":
      return p.professional_experience?.length > 0 ? (
        <Ats key={key} title="EXPÉRIENCE PROFESSIONNELLE">
          {p.professional_experience.map((e, i) => (
            <div key={i} className="mb-3">
              <div className="font-bold">
                {e.role} — {e.company}
                {e.location ? `, ${e.location}` : ""}
              </div>
              <div className="italic">{dateRange(e.start_date, e.end_date)}</div>
              {e.project_description && <p className="mt-0.5">{e.project_description}</p>}
              {e.achievements?.length ? (
                <ul className="list-disc pl-5 mt-0.5">
                  {e.achievements.map((a, j) => <li key={j}>{a}</li>)}
                </ul>
              ) : null}
              {e.technologies?.length ? (
                <p className="mt-0.5"><b>Technologies:</b> {e.technologies.join(", ")}</p>
              ) : null}
            </div>
          ))}
        </Ats>
      ) : null;
    case "education":
      return p.education?.length > 0 ? (
        <Ats key={key} title="FORMATION">
          {p.education.map((e, i) => (
            <div key={i} className="mb-2">
              <div className="font-bold">{e.degree}</div>
              <div>{e.institution}{e.location ? `, ${e.location}` : ""} — {dateRange(e.start_date, e.end_date, e.status)}</div>
              {e.average_score && <div>Moyenne: {e.average_score}</div>}
            </div>
          ))}
        </Ats>
      ) : null;
    case "projects":
      return p.projects?.length > 0 ? (
        <Ats key={key} title="PROJETS">
          {p.projects.slice(0, 4).map((pr, i) => (
            <div key={i} className="mb-2">
              <div className="font-bold">{pr.name}{pr.type ? ` — ${pr.type}` : ""}</div>
              {pr.description && <p>{pr.description}</p>}
            </div>
          ))}
        </Ats>
      ) : null;
    case "certifications":
      return p.certifications?.length > 0 ? (
        <Ats key={key} title="CERTIFICATIONS">
          <ul className="list-disc pl-5">
            {p.certifications.map((c, i) => (
              <li key={i}>
                <b>{c.name}</b> — {c.provider}{c.status ? ` (${c.status})` : ""}
              </li>
            ))}
          </ul>
        </Ats>
      ) : null;
    case "skills":
      return p.skills?.technical ? (
        <Ats key={key} title="COMPÉTENCES TECHNIQUES">
          {Object.entries(p.skills.technical).map(([cat, arr]) => (
            <div key={cat}><b>{cat.replace(/_/g, " ")}:</b> {arr.join(", ")}</div>
          ))}
        </Ats>
      ) : null;
    case "languages":
      return p.skills?.languages?.length > 0 ? (
        <Ats key={key} title="LANGUES">
          <p>{p.skills.languages.map((l) => `${l.language} (${l.cefr ?? l.level})`).join(", ")}</p>
        </Ats>
      ) : null;
  }
}

function Ats({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-4">
      <h2 className="text-[12px] font-bold border-b border-black pb-0.5 mb-1.5">
        {title}
      </h2>
      {children}
    </section>
  );
}
