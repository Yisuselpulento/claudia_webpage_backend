import express from "express"
import { createPreference } from "../controllers/payment.controller.js"

const router = express.Router()

router.post("/create-preference", createPreference)

export default router