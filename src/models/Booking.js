const mongoose=require('mongoose')

const bookingSchema= new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    source:{
        type:{type:String,default:'Point'},
        coordinates:{type:[Number],required:true}
    },
    destination:{
        type:{type:String,default:'Point'},
        coordinates:{type:[Number],required:true}
    },
    luggageCount:{
        type:Number,
        default:0
    },
    status:{
        type:String,
        enum:[
            'PENDING','MATCHED','CANCELLED','COMPLETED'
        ],
        default:'PENDING'
    },
    cost:{
        type:Number
    }

},{timestamps:true})

module.exports=mongoose.model('Booking',bookingSchema)