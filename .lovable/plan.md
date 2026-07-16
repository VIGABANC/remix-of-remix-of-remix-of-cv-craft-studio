Add an inline WYSIWYG editor panel to the CV Studio so users can modify the generated CV before exporting.

Scope for this iteration:

1. Editable profile form sidebar
   - Convert the right-hand preview into a live-editable document.
   - Add a collapsible "Éditer le profil" panel with grouped fields:
     * Identité & contact (full name, role, summary, phone, email, LinkedIn, GitHub, portfolio)
     * Expériences (add / remove / reorder entries; edit role, company, dates, description, achievements)
     * Formation (same pattern)
     * Projets (same pattern)
     * Compétences techniques (category + list)
     * Langues & soft skills
   - Use controlled inputs; every keystroke updates the preview immediately.

2. Section reordering
   - Drag-and-drop reorder for experience, education, project and certification lists.
   - Also allow reordering major CV sections (e.g. move Formation above Expérience) via a "Sections" list in the sidebar.

3. Undo / redo
   - Implement an action history stack (deep-clone of profile state).
   - Top bar gets Undo / Redo buttons with keyboard shortcuts (Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z).

4. Template & style controls
   * Keep existing 4-template selector.
   * Add accent color picker (updates --cv-navy and --cv-accent CSS variables on the preview).
   * Add font-family selector (serif / sans / modern) applied to the CV page.
   * Add spacing slider (compact / normal / relaxed) for section gaps.

5. Add / delete sections
   - "+ Ajouter" buttons for experiences, education, projects, certifications, languages, skills.
   - Trash icon on each item to delete with confirmation toast.

6. Auto-save to local storage
   - Persist edited profile and editor history to localStorage.
   - "Réinitialiser" restores the AI-merged / default profile (with confirmation).

7. Export still works
   - The existing "Télécharger PDF" button renders the edited DOM, so it exports the edited version exactly as shown.

8. UI/UX
   - Sidebar uses tabs: "Documents", "Modèle", "Contenu", "Style".
   - Keep the preview centered and printable.
   - Maintain French copy and premium SaaS feel.

Out of scope for now:
- Inline direct-on-preview editing (click-to-edit on the CV itself).
- AI rewrite inside editor (will be a follow-up).
- Job matching (separate feature).

Files to touch / create:
- src/routes/index.tsx: add editor state, history, tabs, top-bar undo/redo, style controls.
- src/components/cv/CvEditor.tsx: new sidebar editor form component.
- src/components/cv/SectionReorder.tsx: drag handles for major sections.
- src/components/cv/StyleControls.tsx: color, font, spacing controls.
- src/lib/profile.ts: add helper types / empty entry factories.
- src/styles.css: add CSS variable application helpers for accent/font overrides.

Estimated size: medium-large. No backend changes required; all state stays client-side.