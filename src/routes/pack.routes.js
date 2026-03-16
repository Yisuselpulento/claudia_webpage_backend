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


router.get("/packs", getPacks)

router.get("/packs/:id", getPackById)

router.post(
  "/packs",
  requireAdmin,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "images", maxCount: 200 }
  ]),
  createPack
)

router.put(
  "/packs/:id",
  requireAdmin,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "images", maxCount: 200 }
  ]),
  updatePack
)

router.delete(
  "/packs/:id",
  requireAdmin,
  deletePack
)

export default router