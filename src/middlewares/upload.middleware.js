import multer from "multer"

const storage = multer.memoryStorage()

export const upload = multer({
  storage,
  limits:{
    fileSize: 200 * 1024 * 1024 
  },
  fileFilter:(req,file,cb)=>{

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/zip",
      "application/x-zip-compressed",
      "application/octet-stream",
      "multipart/x-zip"
    ]

    if(allowedTypes.includes(file.mimetype)){
      cb(null,true)
    }else{
      cb(new Error("Formato de archivo no permitido"),false)
    }

  }
})