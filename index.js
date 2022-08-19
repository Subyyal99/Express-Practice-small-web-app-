const express = require('express');
const app = express();
const mongoose = require('mongoose')
const dotenv = require('dotenv');
let cors = require("cors");
app.use(cors());

dotenv.config();


mongoose.connect(process.env.DB_CONNECT,
{useNewUrlParser : true},()=>{
console.log('connected to db')
})
app.get('/', (req,res)=>{
    res.send('Server Running')
})

app.use(express.json());
app.use(express.urlencoded({extended:false}))

app.use('/users', require('./routes/user'));

app.listen(4040, ()=>{
    console.log('Server Started')
})