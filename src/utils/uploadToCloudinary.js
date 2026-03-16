import cloudinary from "../config/cloudinary.js"


export const uploadToCloudinary = (file, folder) => {

  return new Promise((resolve,reject)=>{

    if(!file){
      return reject(new Error("No file provided"))
    }

    const uploadStream = cloudinary.uploader.upload_stream(

      {
        folder,
        resource_type:"image",
        type:"upload",
        access_mode:"public"
      },

      (error,result)=>{

        if(error) return reject(error)

        resolve({
          url:result.secure_url,
          publicId:result.public_id
        })

      }

    )

    uploadStream.end(file.buffer)

  })

}

export const deleteFromCloudinary = async (publicId)=>{

  if(!publicId) return

  try{

    await cloudinary.uploader.destroy(publicId,{
      resource_type:"image"
    })

  }catch(error){

    console.error("Error eliminando imagen de Cloudinary:",error)

  }

}