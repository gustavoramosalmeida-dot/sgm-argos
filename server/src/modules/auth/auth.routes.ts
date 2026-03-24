import { Router } from "express";
import { getMe, postLogin, postLogout } from "./auth.controller";

export const authRouter = Router();

authRouter.post("/login", postLogin);
authRouter.post("/logout", postLogout);
authRouter.get("/me", getMe);
