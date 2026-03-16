import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import connectDB from "./config/db.js"

import adminRoutes from "./routes/admin.routes.js"
import packRoutes from "./routes/pack.routes.js"

dotenv.config()

connectDB()

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req,res)=>{
  res.send("API running")
})

/* ---------- ROUTES ---------- */

app.use("/api/admin", adminRoutes)
app.use("/api", packRoutes)



const PORT = process.env.PORT || 5000

app.listen(PORT,()=>{
  console.log(`Server running on ${PORT}`)
})