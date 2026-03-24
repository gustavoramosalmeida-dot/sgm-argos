import QRCode from "qrcode";

const QR_OPTIONS_SVG: QRCode.QRCodeToStringOptions = {
  type: "svg",
  errorCorrectionLevel: "Q",
  margin: 2,
  color: { dark: "#000000", light: "#ffffff" },
  width: undefined,
};

const QR_OPTIONS_PNG: QRCode.QRCodeToBufferOptions = {
  type: "png",
  errorCorrectionLevel: "Q",
  margin: 2,
  color: { dark: "#000000", light: "#ffffff" },
  width: 320,
};

export async function renderQrSvg(payloadUrl: string): Promise<string> {
  return QRCode.toString(payloadUrl, QR_OPTIONS_SVG);
}

export async function renderQrPngBuffer(payloadUrl: string): Promise<Buffer> {
  const buf = await QRCode.toBuffer(payloadUrl, QR_OPTIONS_PNG);
  return buf;
}
