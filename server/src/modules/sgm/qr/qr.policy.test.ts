import { describe, expect, it, vi } from "vitest";

vi.mock("../../../config/env", () => ({
  env: {
    qrResolverAllowedUserIds: ["user-a"],
  },
}));

import { canResolveAssetDetail } from "./qr.policy";

describe("canResolveAssetDetail", () => {
  it("denies without user", () => {
    expect(canResolveAssetDetail(null)).toBe(false);
  });

  it("allows listed user id", () => {
    expect(canResolveAssetDetail("user-a")).toBe(true);
  });

  it("denies user not in list", () => {
    expect(canResolveAssetDetail("user-b")).toBe(false);
  });
});
