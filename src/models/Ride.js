const mongoose=require('mongoose')

const rideSchema= new mongoose.Schema({
    cab:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Cab',
        required:true
    },
    passengers:[{
        bookingid:{type:mongoose.Schema.Types.ObjectId , ref:'Booking'},
        source:{type:[Number],required:true},
        destination:{type:[Number],required:true}
    }],
    status:{
        type:String,
        enum:['MATCHING','STARTED','COMPLETED'],
        default:'MATCHING'
    },
    availabeSeates:{
        type:Number,
        required:true
    },
    totalLuggage:{
        type:Number,
        default:0
    },
    //the planned route:[source A , source B, Dest A , Dest B]
    routeOrder:[{
        type:[Number],
        required:true
    }],
    currentLocation:{
        type:[Number]
    }
},{timestamps:true,versionKey:true})

module.exports=mongoose.model('Ride',rideSchema);