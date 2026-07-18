// Word export using docx library for editable A4 documents
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun, BorderStyle } from "docx";
import type { Profile } from "./profile";

const A4_WIDTH = 11906; // twips (1/20 of a point) - 210mm
const A4_HEIGHT = 16838; // twips - 297mm

export async function exportProfileToWord(profile: Profile, filename: string) {
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: {
            width: A4_WIDTH,
            height: A4_HEIGHT,
          },
          margin: {
            top: 720,
            bottom: 720,
            left: 720,
            right: 720,
          },
        },
      },
      children: generateDocumentContent(profile),
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generateDocumentContent(profile: Profile): Paragraph[] {
  const content: Paragraph[] = [];

  // Header with name and title
  content.push(
    new Paragraph({
      text: profile.profile.full_name,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    })
  );

  if (profile.profile.current_role) {
    content.push(
      new Paragraph({
        text: profile.profile.current_role,
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
      })
    );
  }

  // Contact information
  const contactInfo: string[] = [];
  if (profile.contact.phone) contactInfo.push(profile.contact.phone);
  if (profile.contact.email) contactInfo.push(profile.contact.email);
  if (profile.contact.linkedin) contactInfo.push(profile.contact.linkedin);
  if (profile.contact.github) contactInfo.push(profile.contact.github);
  if (profile.contact.portfolio) contactInfo.push(profile.contact.portfolio);

  if (contactInfo.length > 0) {
    content.push(
      new Paragraph({
        children: [
          new TextRun({
            text: contactInfo.join(" | "),
            size: 20,
            color: "666666",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );
  }

  // Professional Summary
  if (profile.profile.professional_summary) {
    content.push(
      new Paragraph({
        text: "PROFIL",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        border: {
          bottom: {
            color: "1E2A4A",
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );

    content.push(
      new Paragraph({
        children: [
          new TextRun({
            text: profile.profile.professional_summary,
            size: 22,
          }),
        ],
        spacing: { after: 300 },
      })
    );
  }

  // Professional Experience
  if (profile.professional_experience && profile.professional_experience.length > 0) {
    content.push(
      new Paragraph({
        text: "EXPÉRIENCE PROFESSIONNELLE",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        border: {
          bottom: {
            color: "1E2A4A",
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );

    profile.professional_experience.forEach((exp) => {
      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.role,
              bold: true,
              size: 24,
            }),
            new TextRun({
              text: ` — ${exp.company}`,
              italics: true,
              size: 22,
              color: "1E2A4A",
            }),
          ],
          spacing: { before: 200, after: 50 },
        })
      );

      if (exp.location) {
        content.push(
          new Paragraph({
            children: [
              new TextRun({
                text: exp.location,
                size: 20,
                color: "666666",
              }),
            ],
            spacing: { after: 50 },
          })
        );
      }

      const dateRange = `${exp.start_date || ""} — ${exp.end_date || "Présent"}`;
      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text: dateRange,
              size: 20,
              color: "666666",
            }),
          ],
          spacing: { after: 100 },
        })
      );

      if (exp.project_description) {
        content.push(
          new Paragraph({
            text: exp.project_description,
            spacing: { after: 100 },
          })
        );
      }

      if (exp.achievements && exp.achievements.length > 0) {
        exp.achievements.forEach((achievement) => {
          content.push(
            new Paragraph({
              text: `• ${achievement}`,
              spacing: { after: 50 },
              indent: { left: 360 },
            })
          );
        });
      }

      if (exp.technologies && exp.technologies.length > 0) {
        content.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Stack: ",
                bold: true,
              }),
              new TextRun({
                text: exp.technologies.join(" · "),
                color: "666666",
              }),
            ],
            spacing: { after: 300 },
          })
        );
      }
    });
  }

  // Education
  if (profile.education && profile.education.length > 0) {
    content.push(
      new Paragraph({
        text: "FORMATION",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        border: {
          bottom: {
            color: "1E2A4A",
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );

    profile.education.forEach((edu) => {
      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text: edu.degree,
              bold: true,
              size: 24,
            }),
          ],
          spacing: { before: 200, after: 50 },
        })
      );

      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text: edu.institution,
              italics: true,
              size: 22,
              color: "666666",
            }),
            new TextRun({
              text: edu.location ? ` — ${edu.location}` : "",
              italics: true,
              size: 22,
              color: "666666",
            }),
          ],
          spacing: { after: 50 },
        })
      );

      const dateRange = `${edu.start_date || ""} — ${edu.end_date || ""}`;
      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text: dateRange,
              size: 20,
              color: "666666",
            }),
          ],
          spacing: { after: 100 },
        })
      );

      if (edu.description) {
        content.push(
          new Paragraph({
            children: [
              new TextRun({
                text: edu.description,
                size: 22,
              }),
            ],
            spacing: { after: 300 },
          })
        );
      }
    });
  }

  // Skills
  if (profile.skills?.technical) {
    content.push(
      new Paragraph({
        text: "COMPÉTENCES TECHNIQUES",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        border: {
          bottom: {
            color: "1E2A4A",
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );

    Object.entries(profile.skills.technical).forEach(([category, skills]) => {
      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text: category.toUpperCase(),
              bold: true,
              size: 22,
              color: "1E2A4A",
            }),
          ],
          spacing: { before: 150, after: 50 },
        })
      );

      content.push(
        new Paragraph({
          text: skills.join(", "),
          spacing: { after: 200 },
        })
      );
    });
  }

  // Languages
  if (profile.skills?.languages && profile.skills.languages.length > 0) {
    content.push(
      new Paragraph({
        text: "LANGUES",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        border: {
          bottom: {
            color: "1E2A4A",
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );

    profile.skills.languages.forEach((lang) => {
      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text: lang.language,
              bold: true,
            }),
            new TextRun({
              text: ` — ${lang.cefr || lang.level}`,
              color: "666666",
            }),
          ],
          spacing: { after: 100 },
        })
      );
    });
  }

  // Soft Skills
  if (profile.skills?.soft_skills && profile.skills.soft_skills.length > 0) {
    content.push(
      new Paragraph({
        text: "SOFT SKILLS",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        border: {
          bottom: {
            color: "1E2A4A",
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );

    content.push(
      new Paragraph({
        text: profile.skills.soft_skills.join(", "),
        spacing: { after: 300 },
      })
    );
  }

  // Projects
  if (profile.projects && profile.projects.length > 0) {
    content.push(
      new Paragraph({
        text: "PROJETS",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        border: {
          bottom: {
            color: "1E2A4A",
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );

    profile.projects.forEach((project) => {
      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text: project.name,
              bold: true,
              size: 24,
            }),
            new TextRun({
              text: project.type ? ` — ${project.type}` : "",
              italics: true,
              size: 22,
              color: "666666",
            }),
          ],
          spacing: { before: 200, after: 50 },
        })
      );

      if (project.description) {
        content.push(
          new Paragraph({
            text: project.description,
            spacing: { after: 200 },
          })
        );
      }
    });
  }

  // Certifications
  if (profile.certifications && profile.certifications.length > 0) {
    content.push(
      new Paragraph({
        text: "CERTIFICATIONS",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        border: {
          bottom: {
            color: "1E2A4A",
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );

    profile.certifications.forEach((cert) => {
      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text: cert.name,
              bold: true,
            }),
            new TextRun({
              text: ` — ${cert.provider}`,
              color: "666666",
            }),
            new TextRun({
              text: cert.status ? ` (${cert.status})` : "",
              italics: true,
              color: "666666",
            }),
          ],
          spacing: { after: 100 },
        })
      );
    });
  }

  return content;
}
