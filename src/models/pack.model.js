import mongoose from "mongoose"

const packSchema = new mongoose.Schema({

  title:{
    type:String,
    required:true
  },

  slug:{
    type:String,
    required:true,
    unique:true
  },

  description:String,

  price:{
    type:Number,
    required:true
  },

  offer:{
    isActive:{
      type:Boolean,
      default:false
    },
    price:Number
  },

  coverImage:{
    url:String,
    publicId:String
  },

  totalImages:{
    type:Number,
    default:0
  },

  tags:[String],

  zipFile:{
  url:String,
  publicId:String,
  resourceType:String
},
  isActive:{
    type:Boolean,
    default:true
  }

},{timestamps:true})

export default mongoose.model("Pack", packSchema)