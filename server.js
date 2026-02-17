const express= require('express')
const dotenv=require('dotenv')
const PORT=process.env.PORT || 3000
const rideRoutes=require('./src/routes/rideRoutes')
const mongoose=require('mongoose')

const app= express()
dotenv.config();
app.use(express.json())

//!connecting the database
mongoose.connect(process.env.MONGO_URI)
    .then(()=>console.log('mongodb connected'))
    .catch(err => console.log(err))



//!mounting the router
app.use('/api/ride',rideRoutes);

app.get('/',(req,res)=>{
    res.send('api is running')
})


app.listen(PORT,()=>{
    console.log(`server is running at ${PORT}`)
})