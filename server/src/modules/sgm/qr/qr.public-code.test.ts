import { describe, expect, it } from "vitest";
import { formatPublicCodeFromSequence, isValidPublicCodeFormat } from "./qr.public-code";

describe("formatPublicCodeFromSequence", () => {
  it("produces SGM-ATV-000001 for 1", () => {
    expect(formatPublicCodeFromSequence(1)).toBe("SGM-ATV-000001");
  });

  it("pads to 6 digits", () => {
    expect(formatPublicCodeFromSequence(25)).toBe("SGM-ATV-000025");
  });

  it("supports max sequence", () => {
    expect(formatPublicCodeFromSequence(999_999)).toBe("SGM-ATV-999999");
  });

  it("rejects out of range", () => {
    expect(() => formatPublicCodeFromSequence(0)).toThrow();
    expect(() => formatPublicCodeFromSequence(1_000_000)).toThrow();
  });
});

describe("isValidPublicCodeFormat", () => {
  it("accepts official pattern", () => {
    expect(isValidPublicCodeFormat("SGM-ATV-000001")).toBe(true);
  });

  it("rejects invalid", () => {
    expect(isValidPublicCodeFormat("PLANT-1")).toBe(false);
  });
});
