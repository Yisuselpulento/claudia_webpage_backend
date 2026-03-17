import Pack from "../models/pack.model.js"
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/uploadToCloudinary.js"

export const createPack = async (req,res)=>{

  let uploadedCover = null
  let uploadedZip = null

  try{

    const { title, slug, description, price, offer } = req.body
    const tags = req.body.tags ? JSON.parse(req.body.tags) : []

    if(!title || !slug || !price){
      return res.status(400).json({
        success:false,
        message:"Title, slug y price son requeridos"
      })
    }

    const existingPack = await Pack.findOne({slug})

    if(existingPack){
      return res.status(400).json({
        success:false,
        message:"El slug ya existe"
      })
    }

    if(!req.files?.coverImage){
      return res.status(400).json({
        success:false,
        message:"Debes subir una portada"
      })
    }

    if(!req.files?.zipFile){
      return res.status(400).json({
        success:false,
        message:"Debes subir el archivo ZIP"
      })
    }

    const coverFile = req.files.coverImage[0]

    uploadedCover = await uploadToCloudinary(
      coverFile,
      "packs/covers"
    )

    const zipFile = req.files.zipFile[0]

    uploadedZip = await uploadToCloudinary(
      zipFile,
      "packs/zips"
    )

    const pack = await Pack.create({

      title,
      slug,
      description,
      price,
      offer,
      tags,

      coverImage:{
        url: uploadedCover.url,
        publicId: uploadedCover.publicId
      },

      zipFile:{
        url: uploadedZip.url,
        publicId: uploadedZip.publicId,
        resourceType: uploadedZip.resourceType
      }

    })

    return res.status(201).json({
      success:true,
      message:"Pack creado correctamente",
      data:pack
    })

  }catch(error){

    if(uploadedCover){
      await deleteFromCloudinary(uploadedCover.publicId,"image")
    }

    if(uploadedZip){
      await deleteFromCloudinary(uploadedZip.publicId,"raw")
    }

    console.error("createPack:",error)

    return res.status(500).json({
      success:false,
      message:"Error interno del servidor"
    })

  }

}


export const deletePack = async (req,res)=>{

  try{

    const { id } = req.params

    const pack = await Pack.findById(id)

    if(!pack){
      return res.status(404).json({
        success:false,
        message:"Pack no encontrado"
      })
    }

    /* eliminar portada */

    if(pack.coverImage?.publicId){
      await deleteFromCloudinary(
        pack.coverImage.publicId,
        "image"
      )
    }

    /* eliminar zip */

    if(pack.zipFile?.publicId){
      await deleteFromCloudinary(
        pack.zipFile.publicId,
        pack.zipFile.resourceType
      )
    }

    await Pack.findByIdAndDelete(id)

    return res.json({
      success:true,
      message:"Pack eliminado correctamente"
    })

  }catch(error){

    console.error("deletePack:",error)

    return res.status(500).json({
      success:false,
      message:"Error interno del servidor"
    })

  }

}

export const updatePack = async (req,res)=>{

  let newCover = null
  let newZip = null

  try{

    const { id } = req.params
    let { title, slug, description, price, offer, tags } = req.body

    tags = tags ? JSON.parse(tags) : undefined

    const pack = await Pack.findById(id)

    if(!pack){
      return res.status(404).json({
        success:false,
        message:"Pack no encontrado"
      })
    }

    /* ---------- VALIDAR SLUG ---------- */

    if(slug && slug !== pack.slug){

      const existingPack = await Pack.findOne({slug})

      if(existingPack){
        return res.status(400).json({
          success:false,
          message:"El slug ya existe"
        })
      }

    }

    /* ---------- NUEVA PORTADA ---------- */

    if(req.files?.coverImage?.length){

      const coverFile = req.files.coverImage[0]

      newCover = await uploadToCloudinary(
        coverFile,
        "packs/covers"
      )

      if(pack.coverImage?.publicId){
        await deleteFromCloudinary(
          pack.coverImage.publicId,
          "image"
        )
      }

      pack.coverImage = {
        url: newCover.url,
        publicId: newCover.publicId
      }

    }

    /* ---------- NUEVO ZIP ---------- */

    if(req.files?.zipFile?.length){

      const zipFile = req.files.zipFile[0]

      newZip = await uploadToCloudinary(
        zipFile,
        "packs/zips"
      )

      if(pack.zipFile?.publicId){
        await deleteFromCloudinary(
          pack.zipFile.publicId,
          pack.zipFile.resourceType
        )
      }

      pack.zipFile = {
        url: newZip.url,
        publicId: newZip.publicId,
        resourceType: newZip.resourceType
      }

    }

    /* ---------- CAMPOS ---------- */

    if(title !== undefined) pack.title = title
    if(slug !== undefined) pack.slug = slug
    if(description !== undefined) pack.description = description
    if(price !== undefined) pack.price = Number(price)

    if(offer !== undefined){
      pack.offer = JSON.parse(offer)
    }

    if(tags !== undefined){
      pack.tags = tags
    }

    await pack.save()

    return res.json({
      success:true,
      message:"Pack actualizado correctamente",
      data:pack
    })

  }catch(error){

    /* limpiar archivos nuevos si falla */

    if(newCover){
      await deleteFromCloudinary(newCover.publicId,"image")
    }

    if(newZip){
      await deleteFromCloudinary(newZip.publicId,newZip.resourceType)
    }

    console.error("updatePack:",error)

    return res.status(500).json({
      success:false,
      message:"Error interno del servidor"
    })

  }

}

export const getPacks = async (req,res)=>{

  try{

    const packs = await Pack.find({ isActive:true })
      .select("title slug price offer coverImage totalImages tags createdAt")
      .sort({ createdAt:-1 })

    return res.json({
      success:true,
      data:packs
    })

  }catch(error){

    console.error("getPacks:",error)

    return res.status(500).json({
      success:false,
      message:"Error interno del servidor"
    })

  }

}

export const getPackById = async (req,res)=>{

  try{

    const { id } = req.params

    const pack = await Pack.findById(id)

    if(!pack){
      return res.status(404).json({
        success:false,
        message:"Pack no encontrado"
      })
    }

    return res.json({
      success:true,
      data:pack
    })

  }catch(error){

    console.error("getPackById:",error)

    return res.status(500).json({
      success:false,
      message:"Error interno del servidor"
    })

  }

}