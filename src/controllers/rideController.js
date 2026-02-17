const Ride=require('../models/Ride')
const Cab=require('../models/Cab')
const Booking=require('../models/Booking')
const {getDistance}=require('../utils/geoUtils')
const { calculateFare } = require('../utils/pricing');

const MAX_DETOUR_KM=5;

exports.requestRide=async(req,res)=>{
    try{
        
        const {userId,source,destination,luggageCount}=req.body;

        //1. Booking record
        const cost = calculateFare(source, destination);

        const booking=await Booking.create({
            user:userId,
            source:{type:'Point',coordinates:source},
            destination:{type:'Point',coordinates:destination},
            luggageCount,
            cost
        });

        //2. find a match
        const activeRides= await Ride.find({
            status:'MATCHING',
            availableSeats:{$gte:1},
            totalLuggage:{$lte:(4-luggageCount)}
        }).populate('cab');

        let bestRide=null;

        //3. Greedy check each active ride

        for (const ride of activeRides){
            //Get the last stop of the current route

            const currentEnd=ride.routeOrder[ride.routeOrder.length-1]

            //check if the new user's destination is close to the current ride
            const distToEnd=getDistance(destination,currentEnd);

            if(distToEnd<MAX_DETOUR_KM){
                bestRide=ride;
                break;
            }
        }
        // 4. MATCH FOUND: ATOMIC UPDATE (Concurrency Safe)
        if (bestRide) {
            // We try to PUSH to the passengers array AND DECREMENT seats 
            // ONLY IF the ride still has seats available at this exact microsecond.
            const safeUpdate = await Ride.findOneAndUpdate(
                { 
                    _id: bestRide._id, 
                    availableSeats: { $gte: 1 } // DOUBLE CHECK: Constraint inside the query
                },
                {
                    $push: { 
                        passengers: { bookingId: booking._id, source, destination },
                        routeOrder: destination // Add destination to route
                    },
                    $inc: { 
                        availableSeats: -1, // Atomic decrement
                        totalLuggage: luggageCount 
                    }
                },
                { new: true } // Return the updated document
            );

            // If safeUpdate is null, it means someone stole the seat milliseconds ago!
            if (!safeUpdate) {
                // RETRY LOGIC: In a real app, we would loop back to find another ride.
                // For this assignment, we can fallback to creating a new ride.
                console.log("⚠️ Race Condition detected! Seat was taken. creating new ride...");
                // (You can treat this as "No Match Found" and let the code flow to Step 5)
                bestRide = null; 
            } else {
                // SUCCESS: The seat is ours safely.
                booking.status = 'MATCHED';
                await booking.save();

                return res.status(200).json({ 
                    success: true, 
                    message: "Ride Merged! You are sharing a cab.", 
                    rideId: safeUpdate._id,
                    driver: bestRide.cab.driverName
                });
            }
        }
        //5. No match : Create a Brand New ride
        // find the nearest availabe cab within 5km

        const nearestCab=await Cab.findOne({
            isAvailable:true,
            capacity:{$gte:1},
            currentLocation:{
                $near:{
                    $geometry:{type:"Point",coordinates:source},
                    $maxDistance:50000
                }
            }
        });
        if(!nearestCab){
            return res.status(404).json({success:false,message:"NO cabs available nearby"})
        }
        //create the new ride
        const newRide=await Ride.create({
            cab:nearestCab._id,
            passengers:[{bookingId:booking._id,source,destination}],
            availableSeats:nearestCab.capacity-1,
            totalLuggage:luggageCount,
            routeOrder:[source,destination],
            status:'MATCHING'
        });
        //mark cab as busy
        nearestCab.isAvailable=false;
        await nearestCab.save();

        booking.status='MATCHED';
        await booking.save();

        return res.status(201).json({
            success:true,
            message:"new ride started",
            rideId:newRide._id,
            cab:nearestCab
        });
    }catch(error){
        console.error(error);
        res.status(500).json({success:false,error:error.message});
    }
}

exports.updateRideStatus = async (req, res) => {
    try {
        const { rideId, status } = req.body;

        // Validation: Only allow specific status updates
        if (!['STARTED', 'COMPLETED'].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status update" });
        }

        const ride = await Ride.findById(rideId).populate('cab');

        if (!ride) {
            return res.status(404).json({ success: false, message: "Ride not found" });
        }

        // Update the Ride Status
        ride.status = status;
        await ride.save();

        // IF COMPLETED: We must do cleanup!
        if (status === 'COMPLETED') {
            // 1. Free the Cab (Make it available again)
            const cab = await Cab.findById(ride.cab._id);
            cab.isAvailable = true;
            // Optional: Update cab location to the destination? 
            // For now, let's just free it.
            await cab.save();

            // 2. Mark all Passenger Bookings as COMPLETED
            const bookingIds = ride.passengers.map(p => p.bookingId);
            await Booking.updateMany(
                { _id: { $in: bookingIds } }, 
                { status: 'COMPLETED' }
            );
        }

        return res.status(200).json({
            success: true,
            message: `Ride marked as ${status}`,
            ride
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.body;

        // 1. Find and Update the Booking Status
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        // Prevent double cancellation
        if (['CANCELLED', 'COMPLETED'].includes(booking.status)) {
            return res.status(400).json({ success: false, message: "Cannot cancel a completed or already cancelled ride" });
        }

        booking.status = 'CANCELLED';
        await booking.save();

        // 2. ATOMIC UPDATE: Remove passenger from Ride and Free up seat
        // We use $pull to remove the item from the array and $inc to adjust numbers
        const ride = await Ride.findOneAndUpdate(
            { "passengers.bookingId": bookingId }, // Find the ride containing this booking
            {
                $pull: { passengers: { bookingId: bookingId } }, // Remove the passenger object
                $inc: { 
                    availableSeats: 1, // Increase capacity back
                    totalLuggage: -booking.luggageCount // Subtract their luggage
                }
            },
            { new: true } // Return updated ride
        );

        return res.status(200).json({
            success: true,
            message: "Booking cancelled successfully",
            rideId: ride ? ride._id : "Ride not found (maybe not assigned yet)"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
};