import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"
import Admin from "../models/admin.model.js"

dotenv.config()

const createAdmin = async () => {

  await mongoose.connect(process.env.MONGO_URI)

  const password = await bcrypt.hash("123456",10)

  await Admin.create({
    email:"soyclauugomez@gmail.com",
    password
  })

  console.log("Admin creado correctamente")

  process.exit()

}

createAdmin()