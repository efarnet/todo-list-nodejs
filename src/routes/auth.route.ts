import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middlewares/auth.middleware";
import { signupSchema, loginSchema } from "../validators/auth.validator";

const router = Router();

router.post("/signup", validate(signupSchema), authController.signup);
router.post("/login", validate(loginSchema), authController.login);

export default router;
