# 🚖 Smart Airport Ride Pooling System

A high-performance backend system for grouping passengers into shared cabs, optimizing for route deviation and vehicle capacity. Built for the **Hintro Backend Engineer Assignment**.

##  Key Features
- **Smart Pooling Algorithm:** Groups passengers traveling in similar directions with minimal detour (< 5km).
- **Geospatial Querying:** Uses MongoDB `$near` and `$geometry` for efficient location-based searching.
- **Concurrency Safe:** Handles race conditions using Atomic Database Operations (`findOneAndUpdate`), ensuring no seat is double-booked even under high load.
- **Real-time Lifecycle:** Supports Booking, Matching, Ride Completion, and Cancellations.

## 🛠️ Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (with Geospatial Indexing `2dsphere`)
- **ODM:** Mongoose

## ⚙️ Setup & Installation

1. **Clone the Repository**
   ```bash
   git clone <your-repo-url>
   cd airport-ride-pooling

2. **Install Dependencies**
    ```bash
    npm install

3. **Configure environment**
    
    Create a .env file in the root directory:
    ```bash
    MONGO_URI=your_mongodb_connection_string
    PORT=3000

4. **Seed the Database (Dummy Cabs)**
    Initialize the database with dummy cabs around Mumbai airport:
    ```bash
    node seed.js

5. **Start the Server**
    ```bash
    npm start

## Algorithm & Complexity Analysis

The Greedy Matching Strategy
1. The system uses a Greedy Approach to match passengers to existing rides.

2. Fetch Active Rides: Retrieve all rides with status MATCHING and availableSeats >= 1.

3. Filter by Detour: For each active ride, calculate the distance between the current ride's last stop and the new user's destination.

4. Select Best Fit: If the distance is < 5km, the user is added to that ride.

**To satisfy the requirement of handling 10,000 concurrent users, we avoid "Read-Modify-Write" patterns.**

Strategy: Optimistic Concurrency Control via Atomic Operators.
Instead of checking if (seats > 0) in code, we push the condition to the database query:

```bash
await Ride.findOneAndUpdate(
    { _id: rideId, availableSeats: { $gte: 1 } }, // The "Lock"
    { $inc: { availableSeats: -1 }, $push: { passengers: ... } } // The Atomic Update
);


 Api EndPoints
Method,Endpoint,Description
POST,/api/ride/request,Request a ride (Matches existing or creates new)
POST,/api/ride/update-status,Update ride status (COMPLETED) and free up the cab
POST,/api/ride/cancel,Cancel a booking and free up the seat