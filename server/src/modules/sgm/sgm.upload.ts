import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import multer from "multer";
import type { Request } from "express";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads", "machine-photos");

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

const allowedExt = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

export const machinePhotoUpload = multer({
  storage: multer.diskStorage({
    destination: (req: Request, _file, cb) => {
      const machineId = req.params.machineId as string | undefined;
      if (!machineId) {
        cb(new Error("machineId is required"), "");
        return;
      }
      const dir = path.join(UPLOAD_ROOT, machineId);
      ensureDir(dir);
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const extUsed = allowedExt.has(ext) ? ext : ".png";
      cb(null, `${randomUUID()}${extUsed}`);
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
      return;
    }
    cb(new Error("Only image files are allowed"));
  },
});
