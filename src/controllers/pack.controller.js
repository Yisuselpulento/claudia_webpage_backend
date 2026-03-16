import Pack from "../models/pack.model.js"
import Image from "../models/image.model.js"

import { uploadToCloudinary, deleteFromCloudinary } from "../utils/uploadToCloudinary.js"

export const createPack = async (req,res)=>{

  const uploadedImages = []
  let uploadedCover = null

  try{

    const {
    title,
    slug,
    description,
    price,
    offer
  } = req.body

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
        message:"El slug del pack ya existe"
      })
    }


    if(!req.files?.coverImage){
      return res.status(400).json({
        success:false,
        message:"Debes subir una portada"
      })
    }


    if(!req.files?.images || req.files.images.length === 0){
      return res.status(400).json({
        success:false,
        message:"Debes subir al menos una imagen"
      })
    }


    /* ---------- SUBIR PORTADA ---------- */

    const coverFile = req.files.coverImage[0]

    uploadedCover = await uploadToCloudinary(
      coverFile,
      "packs/covers"
    )


    /* ---------- SUBIR IMÁGENES ---------- */

    const imagesIds = []

    for(const file of req.files.images){

      const uploadResult = await uploadToCloudinary(
        file,
        "packs/images"
      )

      uploadedImages.push(uploadResult)

      const imageDoc = await Image.create({

        title:title,

        slug:`${slug}-${Date.now()}`,

        image:{
          url:uploadResult.url,
          publicId:uploadResult.publicId
        },

        tags

      })

      imagesIds.push(imageDoc._id)

    }


    /* ---------- CREAR PACK ---------- */

    const pack = await Pack.create({

      title,
      slug,
      description,
      price,
      offer,
      tags,

      coverImage:{
        url:uploadedCover.url,
        publicId:uploadedCover.publicId
      },

      images:imagesIds,

      totalImages:imagesIds.length

    })


    return res.status(201).json({
      success:true,
      message:"Pack creado correctamente",
      data:pack
    })

  }catch(error){

    if(uploadedCover){
      await deleteFromCloudinary(uploadedCover.publicId)
    }

    for(const img of uploadedImages){
      await deleteFromCloudinary(img.publicId)
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


    /* ---------- ELIMINAR PORTADA ---------- */

    if(pack.coverImage?.publicId){
      await deleteFromCloudinary(pack.coverImage.publicId)
    }


    /* ---------- ELIMINAR IMÁGENES ---------- */

    const images = await Image.find({
      _id:{ $in: pack.images }
    })

    for(const img of images){

      await deleteFromCloudinary(img.image.publicId)

      await Image.findByIdAndDelete(img._id)

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

export const updatePack = async (req, res) => {
  const uploadedImages = []
  let newCover = null

  try {
    const { id } = req.params
    let {
      title,
      slug,
      description,
      price,
      offer,
      tags: tagsString,
      removeImages
    } = req.body

    // Parse tags y removeImages
    const tags = tagsString ? JSON.parse(tagsString) : []
    removeImages = removeImages ? JSON.parse(removeImages) : []

    // Parse offer si viene como string JSON
    offer = offer ? JSON.parse(offer) : undefined

    const pack = await Pack.findById(id)
    if (!pack) return res.status(404).json({ success: false, message: "Pack no encontrado" })

    // ---------- VALIDAR SLUG ÚNICO ----------
    if (slug && slug !== pack.slug) {
      const existingPack = await Pack.findOne({ slug })
      if (existingPack) return res.status(400).json({ success: false, message: "El slug ya existe" })
    }

    // ---------- CAMBIAR PORTADA ----------
    if (req.files?.coverImage) {
      const coverFile = req.files.coverImage[0]
      newCover = await uploadToCloudinary(coverFile, "packs/covers")

      if (pack.coverImage?.publicId) {
        await deleteFromCloudinary(pack.coverImage.publicId)
      }

      pack.coverImage = { url: newCover.url, publicId: newCover.publicId }
    }

    // ---------- ELIMINAR IMÁGENES ----------
    if (removeImages.length > 0) {
      const imagesToDelete = await Image.find({ _id: { $in: removeImages } })
      for (const img of imagesToDelete) {
        await deleteFromCloudinary(img.image.publicId)
        await Image.findByIdAndDelete(img._id)
      }
      pack.images = pack.images.filter(imgId => !removeImages.includes(imgId.toString()))
    }

    // ---------- AGREGAR NUEVAS IMÁGENES ----------
    if (req.files?.images) {
      for (const file of req.files.images) {
        const uploadResult = await uploadToCloudinary(file, "packs/images")
        uploadedImages.push(uploadResult)

        const imageDoc = await Image.create({
          title: title || pack.title,
          slug: `${pack.slug}-${Date.now()}`,
          image: { url: uploadResult.url, publicId: uploadResult.publicId },
          tags
        })

        pack.images.push(imageDoc._id)
      }
    }

    // ---------- ACTUALIZAR CAMPOS ----------
    if (title) pack.title = title
    if (slug) pack.slug = slug
    if (description) pack.description = description
    if (price) pack.price = Number(price)
    if (offer) pack.offer = offer
    if (tags.length > 0) pack.tags = tags

    pack.totalImages = pack.images.length

    await pack.save()

    return res.json({ success: true, message: "Pack actualizado correctamente", data: pack })

  } catch (error) {
    // Eliminar imágenes subidas si ocurre error
    if (newCover) await deleteFromCloudinary(newCover.publicId)
    for (const img of uploadedImages) await deleteFromCloudinary(img.publicId)

    console.error("updatePack:", error)
    return res.status(500).json({ success: false, message: "Error interno del servidor" })
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
      .populate({
        path:"images",
        select:"image.url title"
      })

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