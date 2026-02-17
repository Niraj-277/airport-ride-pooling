const mongoose=require('mongoose')

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['passenger','driver','admin'],
        default:'passenger'
    },
    currentLocation:{
        type:{type:String,default:'Point'},
        coordinates:[Number]
    }
},{timestamps:true});

//Index for geospatial queries
userSchema.index({currentLocation:'2dsphere'});

module.exports=mongoose.model('User',userSchema);