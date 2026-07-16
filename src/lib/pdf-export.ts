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

  // px per mm at the captured resolution
  const pxPerMm = canvas.width / A4_W_MM;
  const pageHeightPx = Math.floor(A4_H_MM * pxPerMm);
  const totalHeightPx = canvas.height;

  let renderedPx = 0;
  let pageIndex = 0;

  while (renderedPx < totalHeightPx) {
    const sliceHeightPx = Math.min(pageHeightPx, totalHeightPx - renderedPx);

    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHeightPx;
    const ctx = pageCanvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context indisponible");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    ctx.drawImage(
      canvas,
      0,
      renderedPx,
      canvas.width,
      sliceHeightPx,
      0,
      0,
      canvas.width,
      sliceHeightPx,
    );

    const imgData = pageCanvas.toDataURL("image/jpeg", 0.95);
    if (pageIndex > 0) pdf.addPage();
    const sliceHeightMm = sliceHeightPx / pxPerMm;
    pdf.addImage(imgData, "JPEG", 0, 0, A4_W_MM, sliceHeightMm);

    renderedPx += sliceHeightPx;
    pageIndex++;
  }

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
