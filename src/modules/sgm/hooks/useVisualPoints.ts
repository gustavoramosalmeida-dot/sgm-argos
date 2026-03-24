import { useCallback, useMemo, useState } from "react";
import type { QRPoint } from "@/types/QRPoint";
import {
  createMachineVisualPoint,
  deleteVisualPoint,
  listMachineVisualPoints,
  updateVisualPoint,
} from "../services/visualPoints.service";
import { mapVisualPointToQRPoint } from "../utils/mapVisualPointToQRPoint";

function isApiQrPointId(id: string): boolean {
  // UUID format 8-4-4-4-12 hex. (não restringe variante RFC4122)
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export function useVisualPoints(machineId?: string) {
  const [points, setPoints] = useState<QRPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canUseApi = useMemo(() => {
    if (!machineId) return false;
    return isApiQrPointId(machineId);
  }, [machineId]);

  const refresh = useCallback(async () => {
    if (!machineId || !canUseApi) return;
    setLoading(true);
    setError(null);
    try {
      const result = await listMachineVisualPoints(machineId);
      setPoints(result.items.map(mapVisualPointToQRPoint));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [machineId, canUseApi]);

  const createPoint = useCallback(
    async (payload: { x: number; y: number; label?: string }): Promise<QRPoint> => {
      if (!machineId || !canUseApi) {
        throw new Error("createPoint requires a valid UUID machineId");
      }
      const created = await createMachineVisualPoint(machineId, payload);
      const mapped = mapVisualPointToQRPoint(created);
      setPoints((prev) => [...prev, mapped]);
      return mapped;
    },
    [machineId, canUseApi]
  );

  const updatePoint = useCallback(
    async (
      visualPointId: string,
      payload: { x?: number; y?: number; label?: string }
    ): Promise<QRPoint> => {
      const updated = await updateVisualPoint(visualPointId, payload);
      const mapped = mapVisualPointToQRPoint(updated);
      setPoints((prev) =>
        prev.map((p) => (String(p.id) === String(mapped.id) ? mapped : p))
      );
      return mapped;
    },
    []
  );

  const deletePointById = useCallback(
    async (visualPointId: string): Promise<void> => {
      await deleteVisualPoint(visualPointId);
      setPoints((prev) => prev.filter((p) => String(p.id) !== String(visualPointId)));
    },
    []
  );

  return {
    points,
    loading,
    error,
    refresh,
    createPoint,
    updatePoint,
    deletePointById,
    canUseApi,
    setPoints,
  };
}

