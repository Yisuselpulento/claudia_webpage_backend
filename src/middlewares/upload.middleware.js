import multer from "multer"

const storage = multer.memoryStorage()

export const upload = multer({
  storage,
  limits:{
    fileSize: 10 * 1024 * 1024 
  },
  fileFilter:(req,file,cb)=>{

    if(
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/webp"
    ){
      cb(null,true)
    }else{
      cb(new Error("Formato de imagen no permitido"),false)
    }

  }
})