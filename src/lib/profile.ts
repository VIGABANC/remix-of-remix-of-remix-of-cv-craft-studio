import defaultProfileData from "@/data/default-profile.json";
import photoAsset from "@/assets/oussama.png.asset.json";

export type EducationEntry = {
  degree: string;
  institution: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  description?: string;
  level?: string;
  average_score?: string;
  decision?: string;
  key_modules?: { name: string; score?: string }[];
};

export type ExperienceEntry = {
  role: string;
  company: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  type?: string;
  project?: string;
  project_description?: string;
  technologies?: string[];
  achievements?: string[];
};

export type ProjectEntry = {
  name: string;
  type?: string;
  description?: string;
  features?: string[];
  tech_stack?: Record<string, string[]>;
};

export type CertificationEntry = {
  name: string;
  provider?: string;
  status?: string;
  expected_date?: string;
  modules?: Record<string, string[]>;
};

export type LanguageEntry = { language: string; level?: string; cefr?: string };

export type Profile = {
  profile: {
    full_name: string;
    date_of_birth?: string;
    nationality?: string;
    current_role?: string;
    professional_summary?: string;
    photo_url?: string;
  };
  contact: {
    phone?: string;
    email?: string;
    address?: { street?: string; city?: string; country?: string };
    linkedin?: string | null;
    portfolio?: string | null;
    github?: string | null;
  };
  education: EducationEntry[];
  certifications: CertificationEntry[];
  professional_experience: ExperienceEntry[];
  projects: ProjectEntry[];
  skills: {
    technical: Record<string, string[]>;
    soft_skills: string[];
    languages: LanguageEntry[];
  };
};

export const defaultProfile: Profile = {
  ...(defaultProfileData as unknown as Profile),
  profile: {
    ...(defaultProfileData as any).profile,
    photo_url: photoAsset.url,
  },
};

export const TEMPLATES = [
  { id: "navy-sidebar", name: "Navy Sidebar", description: "En-tête coloré, colonne latérale marine" },
  { id: "header-timeline", name: "Header Timeline", description: "Bandeau photo + chronologie verticale" },
  { id: "modern-minimal", name: "Modern Minimal", description: "Typographique, accent discret" },
  { id: "ats-strict", name: "ATS Strict", description: "Une colonne, sans icônes, optimisé ATS" },
] as const;

export type TemplateId = (typeof TEMPLATES)[number]["id"];

export type SectionKey = "summary" | "experience" | "education" | "projects" | "certifications" | "skills" | "languages";

export const DEFAULT_SECTION_ORDER: SectionKey[] = [
  "summary",
  "experience",
  "education",
  "projects",
  "certifications",
  "skills",
  "languages",
];

export function emptyExperience(): ExperienceEntry {
  return { role: "", company: "" };
}

export function emptyEducation(): EducationEntry {
  return { degree: "", institution: "" };
}

export function emptyProject(): ProjectEntry {
  return { name: "" };
}

export function emptyCertification(): CertificationEntry {
  return { name: "" };
}

export function emptyLanguage(): LanguageEntry {
  return { language: "" };
}

export function formatDate(d?: string): string {
  if (!d) return "";
  const [y, m] = d.split("-");
  const months = [
    "janv.", "févr.", "mars", "avr.", "mai", "juin",
    "juil.", "août", "sept.", "oct.", "nov.", "déc.",
  ];
  if (m && y) return `${months[parseInt(m, 10) - 1]} ${y}`;
  return y ?? d;
}

export function dateRange(a?: string, b?: string, status?: string): string {
  const start = formatDate(a);
  const end = status === "en cours" ? "Présent" : formatDate(b);
  if (!start && !end) return "";
  if (!end) return start;
  return `${start} — ${end}`;
}
