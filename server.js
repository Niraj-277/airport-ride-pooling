const express= require('express')
const app= express()
const dotenv=require('dotenv')
dotenv.config();
const PORT=process.env.PORT || 3000

app.use(express.json())

app.get('/',(req,res)=>{
    res.send('api is running')
})


app.listen(PORT,()=>{
    console.log(`server is running at ${PORT}`)
})