// PDF export helper that neutralizes modern CSS color functions
// (oklch, oklab, color-mix, lab, lch) which html2canvas cannot parse.

const COLOR_PROPS = [
  "color",
  "backgroundColor",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "outlineColor",
  "textDecorationColor",
  "fill",
  "stroke",
  "columnRuleColor",
  "caretColor",
] as const;

const UNSUPPORTED_RE = /(oklch|oklab|color-mix|lab|lch|color\()/i;

// Use a canvas to resolve any CSS color string the browser understands
// into an rgba() string html2canvas can parse.
let _ctx: CanvasRenderingContext2D | null = null;
function toRgb(color: string): string {
  if (!color || color === "transparent" || color === "none") return color;
  if (!UNSUPPORTED_RE.test(color)) return color;
  if (!_ctx) {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    _ctx = c.getContext("2d", { willReadFrequently: true });
  }
  if (!_ctx) return "#000";
  try {
    _ctx.fillStyle = "#000";
    _ctx.fillStyle = color;
    // After assignment, fillStyle is normalized (#rrggbb or rgba()).
    const normalized = _ctx.fillStyle as string;
    if (UNSUPPORTED_RE.test(normalized)) {
      // Fallback: paint & sample
      _ctx.clearRect(0, 0, 1, 1);
      _ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = _ctx.getImageData(0, 0, 1, 1).data;
      return `rgba(${r},${g},${b},${a / 255})`;
    }
    return normalized;
  } catch {
    return "#000";
  }
}

// Inline sanitized colors + also sanitize gradient / shadow strings.
function sanitizeElement(source: Element, target: HTMLElement) {
  const cs = window.getComputedStyle(source);
  for (const prop of COLOR_PROPS) {
    const v = cs.getPropertyValue(prop as string);
    if (v && UNSUPPORTED_RE.test(v)) {
      target.style.setProperty(hyphenate(prop as string), toRgb(v));
    }
  }
  // background-image / box-shadow can embed color functions too
  const bg = cs.backgroundImage;
  if (bg && UNSUPPORTED_RE.test(bg)) {
    target.style.backgroundImage = sanitizeColorFunctions(bg);
  }
  const shadow = cs.boxShadow;
  if (shadow && UNSUPPORTED_RE.test(shadow)) {
    target.style.boxShadow = sanitizeColorFunctions(shadow);
  }
  const textShadow = cs.textShadow;
  if (textShadow && UNSUPPORTED_RE.test(textShadow)) {
    target.style.textShadow = sanitizeColorFunctions(textShadow);
  }
}

function hyphenate(camel: string): string {
  return camel.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
}

// Replace any oklch(...)/oklab(...)/color-mix(...) tokens inside a longer
// value (gradients, shadows) with their rgb equivalents.
function sanitizeColorFunctions(value: string): string {
  return value.replace(
    /(oklch|oklab|lab|lch|color-mix|color)\(([^()]*(?:\([^()]*\)[^()]*)*)\)/gi,
    (match) => toRgb(match),
  );
}

function walkAndSanitize(originalRoot: Element, cloneRoot: Element) {
  const originals = [originalRoot, ...Array.from(originalRoot.querySelectorAll("*"))];
  const clones = [cloneRoot, ...Array.from(cloneRoot.querySelectorAll("*"))];
  const n = Math.min(originals.length, clones.length);
  for (let i = 0; i < n; i++) {
    const c = clones[i];
    if (c instanceof HTMLElement || c instanceof SVGElement) {
      sanitizeElement(originals[i], c as HTMLElement);
    }
  }
}

export async function exportElementToPdf(el: HTMLElement, filename: string) {
  // Build an off-screen clone so the visible UI is untouched.
  const clone = el.cloneNode(true) as HTMLElement;
  const holder = document.createElement("div");
  holder.style.position = "fixed";
  holder.style.left = "-10000px";
  holder.style.top = "0";
  holder.style.background = "#ffffff";
  holder.style.zIndex = "-1";
  holder.appendChild(clone);
  document.body.appendChild(holder);

  try {
    walkAndSanitize(el, clone);

    const { default: html2pdf } = await import("html2pdf.js");
    await html2pdf()
      .set({
        margin: 0,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          foreignObjectRendering: false,
          logging: false,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] },
      } as never)
      .from(clone)
      .save();
  } finally {
    holder.remove();
  }
}

// Fallback: browser native print-to-PDF. Isolates the CV element by
// hiding everything else via a temporary print stylesheet.
export function printElementFallback(el: HTMLElement) {
  el.setAttribute("data-print-target", "true");
  const style = document.createElement("style");
  style.setAttribute("data-print-helper", "true");
  style.textContent = `
    @page { size: A4 portrait; margin: 0; }
    @media print {
      body * { visibility: hidden !important; }
      [data-print-target], [data-print-target] * { visibility: visible !important; }
      [data-print-target] {
        position: absolute !important;
        left: 0 !important; top: 0 !important;
        width: 210mm !important;
      }
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
  // Safari sometimes doesn't fire afterprint
  setTimeout(cleanup, 60_000);
}
