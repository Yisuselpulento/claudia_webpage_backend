import express from "express"
import { loginAdmin, logoutAdmin, checkAdminAuth } from "../controllers/admin.controller.js"
import { requireAdmin } from "../middlewares/auth.middleware.js"

const router = express.Router()

router.post("/login", loginAdmin)

router.get("/check", requireAdmin, checkAdminAuth)

router.post("/logout", requireAdmin, logoutAdmin)

export default router