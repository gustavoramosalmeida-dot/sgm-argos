import { describe, expect, it } from "vitest";
import { renderQrPngBuffer, renderQrSvg } from "./qr.render";

describe("renderQr", () => {
  const sampleUrl = "http://localhost:3000/q/SGM-ATV-000001";

  it("renders SVG", async () => {
    const svg = await renderQrSvg(sampleUrl);
    expect(svg).toContain("<svg");
    expect(svg.length).toBeGreaterThan(50);
  });

  it("renders PNG buffer", async () => {
    const buf = await renderQrPngBuffer(sampleUrl);
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.length).toBeGreaterThan(100);
  });
});
