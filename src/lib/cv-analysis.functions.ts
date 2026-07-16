import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const UploadedFile = z.object({
  name: z.string(),
  mime: z.string(),
  data: z.string(), // base64 (no data: prefix)
});

const Input = z.object({
  currentProfile: z.any(),
  files: z.array(UploadedFile).min(1).max(10),
});

export const analyzeAndMergeDocuments = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => Input.parse(raw))
  .handler(async ({ data }) => {
    const { callGateway } = await import("./ai-gateway.server");

    const userParts: {
      type: "text" | "image_url" | "file";
      text?: string;
      image_url?: { url: string };
      file?: { filename: string; file_data: string };
    }[] = [];

    userParts.push({
      type: "text",
      text:
        "Voici le profil structuré JSON actuel (source principale de vérité). Utilise les documents joints pour COMPLÉTER les informations manquantes, CORRIGER les erreurs, ENRICHIR les compétences et expériences. Ne jamais inventer. Réponds UNIQUEMENT avec le JSON fusionné final, mêmes clés que l'entrée, français professionnel natif.\n\nPROFIL ACTUEL:\n" +
        JSON.stringify(data.currentProfile),
    });

    for (const f of data.files) {
      const dataUrl = `data:${f.mime};base64,${f.data}`;
      if (f.mime.startsWith("image/")) {
        userParts.push({ type: "image_url", image_url: { url: dataUrl } });
      } else if (f.mime === "application/json" || f.name.endsWith(".json")) {
        // Decode JSON server-side and inject as text
        try {
          const decoded = Buffer.from(f.data, "base64").toString("utf-8");
          userParts.push({
            type: "text",
            text: `Document JSON joint (${f.name}):\n${decoded.slice(0, 40000)}`,
          });
        } catch {
          /* ignore */
        }
      } else {
        // PDF, DOCX, other → send as file part
        userParts.push({
          type: "file",
          file: { filename: f.name, file_data: dataUrl },
        });
      }
    }

    const system =
      "Tu es un recruteur senior, expert ATS et rédacteur professionnel francophone. Ton rôle: analyser les documents fournis (CV, diplômes, relevés de notes, attestations, README, images) et les fusionner intelligemment avec le profil JSON existant. Règles: (1) JSON = source principale, ne pas écraser les données vérifiées. (2) Compléter les infos manquantes. (3) Corriger erreurs OCR. (4) Reformuler les descriptions dans un français naturel, professionnel, natif, avec des verbes d'action forts. (5) Ne jamais inventer de dates, entreprises, diplômes. (6) Retourner STRICTEMENT le JSON final (même structure que l'entrée), sans texte explicatif, sans markdown.";

    const raw = await callGateway({
      model: "google/gemini-2.5-flash",
      system,
      userParts: userParts as never,
      jsonMode: true,
    });

    // Try parse; fallback: extract first JSON object
    try {
      return { profile: JSON.parse(raw) };
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) {
        try {
          return { profile: JSON.parse(m[0]) };
        } catch {
          /* fall through */
        }
      }
      throw new Error("Réponse IA invalide, réessayez.");
    }
  });
