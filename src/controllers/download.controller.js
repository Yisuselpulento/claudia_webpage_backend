import Pack from "../models/pack.model.js"

export const downloadPack = async (req,res)=>{

  const { packId } = req.params

  try{

    const pack = await Pack.findById(packId)

    if(!pack){
      return res.status(404).json({
        success:false,
        message:"Pack no encontrado"
      })
    }

    return res.redirect(pack.zipFile.url)

  }catch(error){

    console.error("downloadPack:",error)

    return res.status(500).json({
      success:false,
      message:"Error descargando pack"
    })

  }

}