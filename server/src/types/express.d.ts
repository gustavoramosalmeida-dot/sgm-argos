declare global {
  namespace Express {
    interface Request {
      /** Preenchido pelo middleware JWT opcional do módulo QR (claim `sub`). */
      sgmUser?: { id: string };
    }
  }
}

export {};
