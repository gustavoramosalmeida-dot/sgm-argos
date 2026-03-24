import type { QRPoint } from "@/types/QRPoint";
import type { VisualPoint } from "@/types/sgm-api";

export function mapVisualPointToQRPoint(vp: VisualPoint): QRPoint {
  return {
    id: vp.id,
    maquinaId: vp.machineId,
    // backend expõe x,y como fração (0–1); frontend usa 0–100
    x: vp.x * 100,
    y: vp.y * 100,
    codigo: vp.qrCode || vp.label || "",
    descricao: vp.label ?? vp.asset?.name ?? "QR point",
    tipo: (vp.asset?.assetType as QRPoint["tipo"]) ?? "outro",
    status: "ok",
    assetId: vp.assetId ?? undefined,
    assetNodeId: vp.assetNodeId ?? undefined,
    assetName: vp.assetName ?? undefined,
    assetNodeType: vp.assetNodeType ?? undefined,
    asset: vp.asset
      ? {
          id: vp.asset.id,
          code: vp.asset.code,
          name: vp.asset.name,
          nodeKind: vp.asset.nodeKind,
          assetType: vp.asset.assetType,
          qrPayload: vp.asset.qrPayload ?? undefined,
        }
      : null,
  };
}

