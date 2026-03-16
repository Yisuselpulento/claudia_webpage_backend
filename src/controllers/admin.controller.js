import Admin from "../models/admin.model.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"


export const loginAdmin = async (req,res)=>{

  const {email,password} = req.body

  try{

    if(!email || !password){
      return res.status(400).json({
        success:false,
        message:"Email y contraseña son requeridos"
      })
    }

    // solo permitir email específico
    if(email !== process.env.ADMIN_EMAIL){
      return res.status(401).json({
        success:false,
        message:"Credenciales inválidas"
      })
    }

    const admin = await Admin.findOne({email})

    if(!admin){
      return res.status(401).json({
        success:false,
        message:"Credenciales inválidas"
      })
    }

    const validPassword = await bcrypt.compare(password, admin.password)

    if(!validPassword){
      return res.status(401).json({
        success:false,
        message:"Credenciales inválidas"
      })
    }

    const token = jwt.sign(
      {id:admin._id},
      process.env.JWT_SECRET,
      {expiresIn:"7d"}
    )

    return res.status(200).json({
      success:true,
      message:"Inicio de sesión exitoso",
      token
    })

  }catch(error){

    console.error("Error en loginAdmin:",error)

    return res.status(500).json({
      success:false,
      message:"Error interno del servidor"
    })

  }

}

export const checkAdminAuth = async (req,res)=>{

  try{

    return res.status(200).json({
      success:true,
      message:"Admin autenticado",
      admin:req.admin
    })

  }catch(error){

    return res.status(500).json({
      success:false,
      message:"Error interno del servidor"
    })

  }

}

export const logoutAdmin = async (req,res)=>{

  try{

    return res.status(200).json({
      success:true,
      message:"Logout exitoso"
    })

  }catch(error){

    return res.status(500).json({
      success:false,
      message:"Error interno del servidor"
    })

  }

}