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

  description:{
    type:String
  },

  price:{
    type:Number,
    required:true
  },

  offer:{
    isActive:{
      type:Boolean,
      default:false
    },

    price:{
      type:Number
    }
  },

  coverImage:{
    url:{
      type:String,
      required:true
    },
    publicId:{
      type:String,
      required:true
    }
  },

  images:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Image",
    required:true
  }],

  totalImages:{
    type:Number,
    default:0
  },

  tags:{
    type:[String],
    default:[]
  },

  isActive:{
    type:Boolean,
    default:true
  }

},{timestamps:true})

export default mongoose.model("Pack", packSchema)