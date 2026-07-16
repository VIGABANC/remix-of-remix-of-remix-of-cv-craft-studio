import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Upload,
  Download,
  RotateCcw,
  Sparkles,
  FileText,
  Loader2,
  Undo2,
  Redo2,
  LayoutTemplate,
  FileEdit,
  Palette,
  FolderOpen,
} from "lucide-react";
// html2pdf.js is imported dynamically inside the download handler (references `self` at module scope, breaks SSR).
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  defaultProfile,
  DEFAULT_SECTION_ORDER,
  TEMPLATES,
  type Profile,
  type SectionKey,
  type TemplateId,
} from "@/lib/profile";
import { analyzeAndMergeDocuments } from "@/lib/cv-analysis.functions";
import { NavySidebar } from "@/components/cv/templates/NavySidebar";
import { HeaderTimeline } from "@/components/cv/templates/HeaderTimeline";
import { ModernMinimal } from "@/components/cv/templates/ModernMinimal";
import { AtsStrict } from "@/components/cv/templates/AtsStrict";
import { CvEditor } from "@/components/cv/CvEditor";
import { SectionReorder } from "@/components/cv/SectionReorder";
import { StyleControls, DEFAULT_STYLE, type EditorStyle } from "@/components/cv/StyleControls";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CV Studio · Générateur de CV professionnel piloté par IA" },
      {
        name: "description",
        content:
          "Créez un CV professionnel niveau ATS depuis vos documents (PDF, DOCX, images, JSON). 4 modèles, français natif, export PDF.",
      },
      { property: "og:title", content: "CV Studio · Générateur de CV professionnel piloté par IA" },
      { property: "og:description", content: "Créez un CV professionnel niveau ATS depuis vos documents (PDF, DOCX, images, JSON). 4 modèles, français natif, export PDF." },
    ],
  }),
  component: Index,
});

const MAX_MB = 15;
const STORAGE_KEY = "cv-studio-state-v3";

type AppState = {
  profile: Profile;
  templateId: TemplateId;
  sectionOrder: SectionKey[];
  style: EditorStyle;
};

function buildInitialState(): AppState {
  if (typeof window === "undefined") {
    return { profile: defaultProfile, templateId: "navy-sidebar", sectionOrder: DEFAULT_SECTION_ORDER, style: DEFAULT_STYLE };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (!parsed.profile?.profile?.photo_url && defaultProfile.profile.photo_url) {
        parsed.profile = { ...parsed.profile, profile: { ...parsed.profile.profile, photo_url: defaultProfile.profile.photo_url } };
      }
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return { profile: defaultProfile, templateId: "navy-sidebar", sectionOrder: DEFAULT_SECTION_ORDER, style: DEFAULT_STYLE };
}

async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
  }
  return btoa(binary);
}

function Index() {
  const initial = useMemo(buildInitialState, []);
  const [appState, setAppState] = useState<AppState>(initial);
  const { profile, templateId, sectionOrder, style } = appState;
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedNames, setUploadedNames] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cvRef = useRef<HTMLDivElement>(null);
  const analyze = useServerFn(analyzeAndMergeDocuments);

  // Undo / redo history — single state to keep index and stack in sync
  const [history, setHistory] = useState<{ stack: AppState[]; index: number }>({
    stack: [initial],
    index: 0,
  });

  const pushHistory = useCallback((next: AppState) => {
    setHistory((prev) => {
      const trimmed = prev.stack.slice(0, prev.index + 1);
      const stack = [...trimmed, next].slice(-50);
      return { stack, index: stack.length - 1 };
    });
  }, []);

  const commit = useCallback((partial: Partial<AppState>) => {
    setAppState((prev) => {
      const next = { ...prev, ...partial };
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const update = useCallback((fn: (p: Profile) => Profile) => {
    const next = fn(profile);
    commit({ profile: next });
  }, [commit, profile]);

  const setTemplate = useCallback((id: TemplateId) => {
    commit({ templateId: id });
  }, [commit]);

  const setOrder = useCallback((order: SectionKey[]) => {
    commit({ sectionOrder: order });
  }, [commit]);

  const setStyleAndHistory = useCallback((s: EditorStyle) => {
    commit({ style: s });
  }, [commit]);

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.index > 0) {
        const index = prev.index - 1;
        setAppState(prev.stack[index]);
        return { ...prev, index };
      }
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.index < prev.stack.length - 1) {
        const index = prev.index + 1;
        setAppState(prev.stack[index]);
        return { ...prev, index };
      }
      return prev;
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  // Auto-save
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch {
      /* ignore */
    }
  }, [appState]);

  const handleDownload = useCallback(async () => {
    if (!cvRef.current) return;
    setIsDownloading(true);
    const t = toast.loading("Génération du PDF…");
    try {
      const filename = `CV_${profile.profile.full_name.replace(/\s+/g, "_")}.pdf`;
      const { exportElementToPdf } = await import("@/lib/pdf-export");
      await exportElementToPdf(cvRef.current, filename);
      toast.success("PDF téléchargé", { id: t });
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Erreur lors de la génération du PDF", { id: t });
    } finally {
      setIsDownloading(false);
    }
  }, [profile]);

  const handleFiles = useCallback(
    async (fileList: FileList) => {
      const files = Array.from(fileList).slice(0, 10);
      const oversized = files.find((f) => f.size > MAX_MB * 1024 * 1024);
      if (oversized) {
        toast.error(`Fichier trop volumineux (max ${MAX_MB} Mo) : ${oversized.name}`);
        return;
      }
      setIsAnalyzing(true);
      const t = toast.loading(`Analyse de ${files.length} document(s) par l'IA…`);
      try {
        const payload = await Promise.all(
          files.map(async (f) => ({
            name: f.name,
            mime: f.type || "application/octet-stream",
            data: await fileToBase64(f),
          })),
        );
        const res = await analyze({ data: { currentProfile: profile, files: payload } });
        const merged = res.profile as Profile;
        if (!merged.profile?.photo_url && profile.profile?.photo_url) {
          merged.profile = { ...merged.profile, photo_url: profile.profile.photo_url };
        }
        const nextState: AppState = { profile: merged, templateId, sectionOrder, style };
        setAppState(nextState);
        pushHistory(nextState);
        setUploadedNames((n) => [...n, ...files.map((f) => f.name)]);
        toast.success("Profil enrichi avec succès", { id: t });
      } catch (err) {
        console.error(err);
        toast.error(err instanceof Error ? err.message : "Erreur lors de l'analyse", { id: t });
      } finally {
        setIsAnalyzing(false);
      }
    },
    [analyze, profile, templateId, sectionOrder, style, pushHistory],
  );

  const [dragOver, setDragOver] = useState(false);

  const cv = useMemo(() => {
    switch (templateId) {
      case "navy-sidebar": return <NavySidebar p={profile} order={sectionOrder} />;
      case "header-timeline": return <HeaderTimeline p={profile} order={sectionOrder} />;
      case "modern-minimal": return <ModernMinimal p={profile} order={sectionOrder} />;
      case "ats-strict": return <AtsStrict p={profile} order={sectionOrder} />;
    }
  }, [templateId, profile, sectionOrder]);

  const canUndo = history.index > 0;
  const canRedo = history.index < history.stack.length - 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="no-print border-b bg-card/60 backdrop-blur sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cv-navy text-cv-navy-foreground grid place-items-center font-display font-bold">
              CV
            </div>
            <div>
              <div className="font-display text-lg leading-none">CV Studio</div>
              <div className="text-[11px] text-muted-foreground">
                Générateur de CV professionnel · IA
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={undo} disabled={!canUndo}>
              <Undo2 className="w-4 h-4 mr-1.5" /> Annuler
            </Button>
            <Button variant="outline" size="sm" onClick={redo} disabled={!canRedo}>
              <Redo2 className="w-4 h-4 mr-1.5" /> Refaire
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
              if (confirm("Réinitialiser tout le profil et les modifications ?")) {
                  const reset: AppState = { profile: defaultProfile, templateId: "navy-sidebar", sectionOrder: DEFAULT_SECTION_ORDER, style: DEFAULT_STYLE };
                  setAppState(reset);
                  setUploadedNames([]);
                  pushHistory(reset);
                  toast.success("Profil réinitialisé");
                }
              }}
            >
              <RotateCcw className="w-4 h-4 mr-1.5" /> Réinitialiser
            </Button>
            <Button size="sm" onClick={handleDownload} disabled={isDownloading} className="bg-cv-navy hover:bg-cv-navy/90 text-cv-navy-foreground">
              {isDownloading ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Download className="w-4 h-4 mr-1.5" />}
              Télécharger PDF
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
        {/* Sidebar controls */}
        <aside className="no-print">
          <Tabs defaultValue="documents" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="documents" className="text-[10px]">
                <FolderOpen className="w-3.5 h-3.5 mr-1" /> Docs
              </TabsTrigger>
              <TabsTrigger value="template" className="text-[10px]">
                <LayoutTemplate className="w-3.5 h-3.5 mr-1" /> Modèle
              </TabsTrigger>
              <TabsTrigger value="content" className="text-[10px]">
                <FileEdit className="w-3.5 h-3.5 mr-1" /> Contenu
              </TabsTrigger>
              <TabsTrigger value="style" className="text-[10px]">
                <Palette className="w-3.5 h-3.5 mr-1" /> Style
              </TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="space-y-5 mt-0">
              <section>
                <h2 className="text-[11px] uppercase tracking-[0.25em] font-semibold text-muted-foreground mb-3">
                  Documents source
                </h2>
                <label
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
                  }}
                  className={`block rounded-xl border-2 border-dashed p-5 cursor-pointer transition-colors text-center ${
                    dragOver ? "border-cv-navy bg-cv-navy/5" : "border-border hover:border-cv-navy/60 hover:bg-muted/40"
                  }`}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc,.json,.png,.jpg,.jpeg,.webp,.txt,.md"
                    className="hidden"
                    onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files); }}
                  />
                  {isAnalyzing ? (
                    <div className="py-2 flex flex-col items-center gap-2 text-sm">
                      <Loader2 className="w-6 h-6 animate-spin text-cv-navy" />
                      <span>L'IA lit et fusionne vos documents…</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-7 h-7 mx-auto text-cv-navy" />
                      <div className="mt-2 text-sm font-medium">Glissez vos fichiers ici</div>
                      <div className="text-[11.5px] text-muted-foreground mt-1">
                        PDF, DOCX, JSON, images · max 10 fichiers, {MAX_MB} Mo chacun
                      </div>
                    </>
                  )}
                </label>
                {uploadedNames.length > 0 && (
                  <ul className="mt-3 space-y-1 text-[11.5px]">
                    {uploadedNames.map((n, i) => (
                      <li key={`${n}-${i}`} className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="w-3.5 h-3.5" /> {n}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
                  <Sparkles className="inline w-3 h-3 mr-1 -mt-0.5" />
                  Le profil actuel est <b>préchargé</b>. Chaque document ajouté est analysé par l'IA et fusionné intelligemment. Aucune donnée n'est inventée.
                </p>
              </section>

              <section>
                <h2 className="text-[11px] uppercase tracking-[0.25em] font-semibold text-muted-foreground mb-3">
                  Aperçu du profil
                </h2>
                <div className="rounded-lg border bg-card p-3 text-[11.5px] space-y-1">
                  <div className="font-semibold">{profile.profile.full_name}</div>
                  <div className="text-muted-foreground">{profile.profile.current_role}</div>
                  <div className="pt-2 grid grid-cols-2 gap-1 text-[10.5px]">
                    <Stat n={profile.professional_experience?.length ?? 0} l="Expériences" />
                    <Stat n={profile.education?.length ?? 0} l="Formations" />
                    <Stat n={profile.projects?.length ?? 0} l="Projets" />
                    <Stat n={profile.certifications?.length ?? 0} l="Certifs." />
                  </div>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="template" className="space-y-5 mt-0">
              <section>
                <h2 className="text-[11px] uppercase tracking-[0.25em] font-semibold text-muted-foreground mb-3">
                  Modèle
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTemplate(t.id)}
                      className={`text-left rounded-lg border p-3 transition ${
                        templateId === t.id
                          ? "border-cv-navy bg-cv-navy/5 ring-1 ring-cv-navy"
                          : "border-border hover:border-cv-navy/50"
                      }`}
                    >
                      <div className="text-[12.5px] font-semibold">{t.name}</div>
                      <div className="text-[10.5px] text-muted-foreground leading-tight mt-0.5">
                        {t.description}
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-[11px] uppercase tracking-[0.25em] font-semibold text-muted-foreground mb-3">
                  Ordre des sections
                </h2>
                <SectionReorder order={sectionOrder} setOrder={setOrder} />
              </section>
            </TabsContent>

            <TabsContent value="content" className="space-y-5 mt-0">
              <CvEditor profile={profile} update={update} />
            </TabsContent>

            <TabsContent value="style" className="space-y-5 mt-0">
              <section className="border rounded-lg p-3 bg-card">
                <h2 className="text-[11px] uppercase tracking-[0.25em] font-semibold text-muted-foreground mb-3">
                  Apparence
                </h2>
                <StyleControls style={style} setStyle={setStyleAndHistory} />
              </section>
            </TabsContent>
          </Tabs>
        </aside>

        {/* Preview */}
        <main>
          <div className="cv-print-root">
            <div
              ref={cvRef}
              className="cv-wrapper mx-auto"
              style={{ width: "210mm" }}
              data-accent-navy={style.accentNavy}
              data-accent-color={style.accentColor}
              data-font={style.font}
              data-spacing={style.spacing}
            >
              {cv}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Stat({ n, l }: { n: number; l: string }) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="font-semibold text-cv-navy">{n}</span>
      <span className="text-muted-foreground">{l}</span>
    </div>
  );
}
