const express=require('express')
const router= express.Router();
const {requestRide,updateRideStatus,cancelBooking}=require('../controllers/rideController')

//Post http://localhost:3000/api/ride/request

router.post('/request',requestRide);
router.post('/update-status', updateRideStatus);
router.post('/cancel', cancelBooking);

module.exports=router;