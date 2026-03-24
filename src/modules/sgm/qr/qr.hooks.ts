import { useCallback, useEffect, useState } from 'react';
import { ensureAssetQr, getAssetQr } from './qr.api';
import type { AssetQrDto, EnsureAssetQrDto } from './qr.types';

function ensureToDto(r: EnsureAssetQrDto): AssetQrDto {
  return {
    assetId: r.assetId,
    publicCode: r.publicCode,
    qrValue: r.qrValue,
    resolvedUrl: r.resolvedUrl,
    svgUrl: r.svgUrl,
    pngUrl: r.pngUrl,
    generatedAt: r.generatedAt,
    status: 'active',
  };
}

export function useAssetQr(assetId: string | null | undefined) {
  const [data, setData] = useState<AssetQrDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [ensuring, setEnsuring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!assetId) {
      setData(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const dto = await getAssetQr(assetId);
      setData(dto);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setData(null);
      setError(msg.includes('404') ? 'Ativo não encontrado.' : 'Não foi possível carregar o QR.');
    } finally {
      setLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    void load();
  }, [load]);

  const ensure = useCallback(async () => {
    if (!assetId) return;
    setEnsuring(true);
    setError(null);
    try {
      const res = await ensureAssetQr(assetId);
      setData(ensureToDto(res));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(
        msg.includes('API error 400')
          ? 'Este ativo não pode receber QR oficial.'
          : 'Não foi possível gerar o QR. Tente novamente.'
      );
      throw e;
    } finally {
      setEnsuring(false);
    }
  }, [assetId]);

  return { data, loading, ensuring, error, setError, reload: load, ensure };
}
