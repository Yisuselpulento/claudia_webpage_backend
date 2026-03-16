import mongoose from "mongoose"

const imageSchema = new mongoose.Schema({

  title:{
    type:String,
    required:true
  },

  slug:{
    type:String,
    required:true,
    unique:true
  },

  image:{
    url:{
      type:String,
      required:true
    },
    publicId:{
      type:String,
      required:true
    }
  },

  tags:[String]

},{timestamps:true})

export default mongoose.model("Image", imageSchema)