import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";

vi.mock("./qr.repository", () => ({
  findByPublicCode: vi.fn(),
  insertQrResolveAudit: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./qr.policy", () => ({
  canResolveAssetDetail: vi.fn(() => true),
}));

import { qrPublicResolve } from "./qr.public-resolver";
import { findByPublicCode, insertQrResolveAudit } from "./qr.repository";
import { canResolveAssetDetail } from "./qr.policy";

function mockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    redirect: vi.fn().mockReturnThis(),
  };
  return res as unknown as Response;
}

describe("qrPublicResolve", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(canResolveAssetDetail).mockReturnValue(true);
  });

  it("returns not_found for invalid format without lookup", async () => {
    const req = {
      params: { publicCode: "INVALID" },
      get: vi.fn().mockReturnValue(null),
      ip: "127.0.0.1",
    } as unknown as Request;
    const res = mockRes();
    await qrPublicResolve(req, res);
    expect(findByPublicCode).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(insertQrResolveAudit).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: "not_found" })
    );
  });

  it("returns not_found when code format ok but asset missing", async () => {
    vi.mocked(findByPublicCode).mockResolvedValueOnce(null);
    const req = {
      params: { publicCode: "SGM-ATV-000099" },
      get: vi.fn().mockReturnValue(null),
      ip: "127.0.0.1",
    } as unknown as Request;
    const res = mockRes();
    await qrPublicResolve(req, res);
    expect(findByPublicCode).toHaveBeenCalledWith("SGM-ATV-000099");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(insertQrResolveAudit).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: "not_found", publicCode: "SGM-ATV-000099" })
    );
  });

  it("redirects to login when unauthenticated", async () => {
    vi.mocked(findByPublicCode).mockResolvedValueOnce({
      assetId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      publicCode: "SGM-ATV-000001",
      machineId: "11111111-2222-3333-4444-555555555555",
    });
    const req = {
      params: { publicCode: "SGM-ATV-000001" },
      get: vi.fn().mockReturnValue(null),
      ip: "127.0.0.1",
    } as unknown as Request;
    const res = mockRes();
    await qrPublicResolve(req, res);
    expect(res.redirect).toHaveBeenCalledWith(302, expect.stringContaining("/login"));
    expect(insertQrResolveAudit).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: "unauthenticated" })
    );
  });

  it("returns 403 when authenticated but not authorized", async () => {
    vi.mocked(canResolveAssetDetail).mockReturnValue(false);
    vi.mocked(findByPublicCode).mockResolvedValueOnce({
      assetId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      publicCode: "SGM-ATV-000001",
      machineId: null,
    });
    const req = {
      params: { publicCode: "SGM-ATV-000001" },
      sgmUser: { id: "user-x" },
      get: vi.fn().mockReturnValue(null),
      ip: "127.0.0.1",
    } as unknown as Request;
    const res = mockRes();
    await qrPublicResolve(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(insertQrResolveAudit).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: "unauthorized" })
    );
  });

  it("redirects to machine when resolved", async () => {
    vi.mocked(findByPublicCode).mockResolvedValueOnce({
      assetId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      publicCode: "SGM-ATV-000001",
      machineId: "11111111-2222-3333-4444-555555555555",
    });
    const req = {
      params: { publicCode: "SGM-ATV-000001" },
      sgmUser: { id: "user-x" },
      get: vi.fn().mockReturnValue(null),
      ip: "127.0.0.1",
    } as unknown as Request;
    const res = mockRes();
    await qrPublicResolve(req, res);
    expect(res.redirect).toHaveBeenCalledWith(
      302,
      expect.stringContaining("/machines/11111111-2222-3333-4444-555555555555")
    );
    expect(insertQrResolveAudit).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: "resolved" })
    );
  });
});
