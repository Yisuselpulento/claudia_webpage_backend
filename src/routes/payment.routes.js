import express from "express"
import { createPreference, verifyPayment } from "../controllers/payment.controller.js"

const router = express.Router()

router.post("/create-preference", createPreference)

/* verificar pago */
router.get("/verify/:paymentId", verifyPayment)

export default router