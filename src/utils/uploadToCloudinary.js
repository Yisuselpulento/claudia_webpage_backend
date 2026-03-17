import cloudinary from "../config/cloudinary.js"

export const uploadToCloudinary = (file, folder) => {

  return new Promise((resolve,reject)=>{

    if(!file){
      return reject(new Error("No file provided"))
    }

    const uploadStream = cloudinary.uploader.upload_stream(

      {
        folder,
        resource_type:"auto"
      },

      (error,result)=>{

        if(error) return reject(error)

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type
        })

      }

    )

    uploadStream.end(file.buffer)

  })

}
export const deleteFromCloudinary = async (publicId, resourceType="image")=>{

  if(!publicId) return

  try{

    await cloudinary.uploader.destroy(publicId,{
      resource_type: resourceType
    })

  }catch(error){

    console.error("Error eliminando archivo de Cloudinary:",error)

  }

}