import { describe, expect, it, vi } from "vitest";
import type { Request } from "express";
import { ensureAssetQrService } from "./qr.service";

vi.mock("./qr.repository", () => ({
  ensureAssetPublicCode: vi.fn(),
}));

import { ensureAssetPublicCode } from "./qr.repository";

function mockReq(): Request {
  return {
    protocol: "http",
    get: vi.fn().mockReturnValue("localhost:3000"),
  } as unknown as Request;
}

describe("ensureAssetQrService", () => {
  it("monta URLs canônicas a partir do public_code", async () => {
    vi.mocked(ensureAssetPublicCode).mockResolvedValue({
      publicCode: "SGM-ATV-000001",
      qrGeneratedAt: new Date("2020-01-01T00:00:00.000Z"),
      wasCreated: true,
    });
    const assetId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
    const out = await ensureAssetQrService(assetId, mockReq());
    expect(out.assetId).toBe(assetId);
    expect(out.publicCode).toBe("SGM-ATV-000001");
    expect(out.qrValue).toBe("http://localhost:5173/q/SGM-ATV-000001");
    expect(out.resolvedUrl).toBe(out.qrValue);
    expect(out.svgUrl).toContain(`/api/sgm/assets/${assetId}/qr.svg`);
    expect(out.pngUrl).toContain(`/api/sgm/assets/${assetId}/qr.png`);
  });

  it("reutiliza o mesmo formato quando ensure retorna código existente", async () => {
    vi.mocked(ensureAssetPublicCode).mockResolvedValue({
      publicCode: "SGM-ATV-000042",
      qrGeneratedAt: new Date("2021-06-15T12:00:00.000Z"),
      wasCreated: false,
    });
    const out = await ensureAssetQrService("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee", mockReq());
    expect(out.publicCode).toBe("SGM-ATV-000042");
    expect(out.qrValue).toContain("SGM-ATV-000042");
  });
});
