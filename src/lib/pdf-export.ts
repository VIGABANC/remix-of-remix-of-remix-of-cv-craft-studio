// Direct PDF download using html2canvas-pro (native oklch/oklab/color-mix support)
// + jsPDF, slicing the rendered canvas into A4 pages.

import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

const A4_W_MM = 210;
const A4_H_MM = 297;

export async function exportElementToPdf(el: HTMLElement, filename: string) {
  // Render the element at 2x for crisp text/images.
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
    windowWidth: el.scrollWidth,
    windowHeight: el.scrollHeight,
  });

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  // Fit the entire CV onto a single A4 page.
  const pxPerMmWidth = canvas.width / A4_W_MM;
  const naturalHeightMm = canvas.height / pxPerMmWidth;

  let renderWidthMm = A4_W_MM;
  let renderHeightMm = naturalHeightMm;
  if (naturalHeightMm > A4_H_MM) {
    // Scale down uniformly so the whole content fits on one page.
    const scale = A4_H_MM / naturalHeightMm;
    renderHeightMm = A4_H_MM;
    renderWidthMm = A4_W_MM * scale;
  }
  const offsetXmm = (A4_W_MM - renderWidthMm) / 2;

  const imgData = canvas.toDataURL("image/jpeg", 0.95);
  pdf.addImage(imgData, "JPEG", offsetXmm, 0, renderWidthMm, renderHeightMm);

  pdf.save(filename);
}

// Kept for compatibility; no longer the primary path.
export function printElementFallback(el: HTMLElement) {
  el.setAttribute("data-print-target", "true");
  const style = document.createElement("style");
  style.textContent = `
    @page { size: A4 portrait; margin: 0; }
    @media print {
      body * { visibility: hidden !important; }
      [data-print-target], [data-print-target] * { visibility: visible !important; }
      [data-print-target] { position: absolute !important; left: 0 !important; top: 0 !important; width: 210mm !important; }
      html, body { background: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  `;
  document.head.appendChild(style);
  const cleanup = () => {
    style.remove();
    el.removeAttribute("data-print-target");
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  window.print();
  setTimeout(cleanup, 60_000);
}
