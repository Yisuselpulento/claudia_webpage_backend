import express from "express"
import { downloadPack } from "../controllers/download.controller.js"

const router = express.Router()

router.get("/download/pack/:packId", downloadPack)

export default router