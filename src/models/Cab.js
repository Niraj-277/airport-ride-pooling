const mongoose=require('mongoose')

const cabSchema=new mongoose.Schema({
    driverName:{
        type:String,
        required:true
    },
    licensePlate:{
        type:String,
        required:true,
        unique:true
    },
    capacity:{
        type:Number,
        default:4 
    },
    //luggage capacity constraint check
    luggageCapacity:{
        type:Number,
        default:2
    },
    currentLocation:{
        type:{type:String,default:'Point'},
        coordinates:[number]
    },
    isAvailabe:{
        type:Boolean,
        default:true
    }
},{timestamps:true});

cabSchema.index({currentLocation:'2dsphere'});

module.exports=mongoose.model('Cab',cabSchema);