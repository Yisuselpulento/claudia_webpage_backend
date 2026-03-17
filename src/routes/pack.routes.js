import express from "express"

import { requireAdmin } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/upload.middleware.js"

import {
  createPack,
  updatePack,
  deletePack,
  getPacks,
  getPackById
} from "../controllers/pack.controller.js"

const router = express.Router()

/* ---------- PUBLIC ---------- */

router.get("/packs", getPacks)

router.get("/packs/:id", getPackById)

/* ---------- ADMIN ---------- */

router.post(
  "/packs",
  requireAdmin,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "zipFile", maxCount: 1 }
  ]),
  createPack
)

router.put(
  "/packs/:id",
  requireAdmin,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "zipFile", maxCount: 1 }
  ]),
  updatePack
)

router.delete(
  "/packs/:id",
  requireAdmin,
  deletePack
)

export default router