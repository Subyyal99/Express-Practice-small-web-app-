const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const user = require('../models/usermodel')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const mid_verify = (req, res, next) =>{
    const token = req.header('token')
    console.log(token)
    if(!token) return res.status(405).send('Access denied')

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        // console.log(err)
        if (err) return res.sendStatus(403)
        req.user = user
        //console.log("user "+user._id)
        //console.log(" requser "+req.user)
        next()
      })
    }


// router.get('/home',mid_verify, async (req, res)=>{
//     // res.send('in users')
//     const id = req.user._id
//    // console.log(id)
//     const users = await user.findById(id);
//     res.json(users);
// })

router.put('/profile/update/:id', async (req, res)=>{
    try{
    const userone = await user.findById({_id : req.params.id});
    const updateuser = await user.updateOne({_id: req.params.id},{
        $set : {name : req.body.name ? req.body.name : userone.name,
             email : req.body.email ? req.body.email : userone.email}
    })
    res.json({msg: "updated", updateuser}) 
}
catch(err){
    res.json({msg: "User Does not Exist", err})
}

})

router.post('/signin', async (req, res)=>{
    //res.send('sign in')
    if(!req.body.name || !req.body.email || !req.body.password){
        //return res.status(404).send('Fill Field correctly')
        return res.json({msg: 'Fill Field correctly'})
    }
    const emailexist = await user.findOne({email : req.body.email})

    if(emailexist){
        console.log(emailexist)
        //return res.status(400).send("Email Already Exist")
        return res.json({msg: 'Email Already Exist'})
    }
    try{
        const salt = await bcrypt.genSalt();
        const hashpassword =await  bcrypt.hash(req.body.password, salt);
        const new_user = new user({
            "name": req.body.name,
            "email": req.body.email,
            "gender": req.body.gender,
            "password": hashpassword
        });
        console.log(new_user)
        new_user.save()
        .then(res.json({msg:"Registered ", bnda : new_user}))

    }
    catch(err){
        res.send(err)
    }  
})

router.post('/login', async (req, res)=>{
    //res.send('login')
    if(!req.body.email || !req.body.password){
        //return res.status(404).send('Fill Fields Correctly')
        return res.json({msg:'Fill Fields Correctly'})

    }
    try{
    const found = await user.findOne({email: req.body.email})
    if(found){
        const success = await bcrypt.compare(req.body.password, found.password)
        if(success){
            const token = jwt.sign({_id : found._id}, process.env.TOKEN_SECRET);
             res.header('token', token)
             res.json({msg:"Login ", token: token, bnda: found})
             //res.redirect('/')
           //res.send('Logged In')
          // res.redirect('/home')

        }
        else{
            //res.status(403).send('Password does not Match!')
            res.json({msg:'Password does not Match!'})

        }
        
    }
    else{
        res.json({msg:"User Email does not exist"})
    }
}
catch(err){
    console.log(err)
    res.send(err)
}
})

router.get('/admin', async (req, res) =>{
    console.log('here')
    // const users = await user.findById({_id: req.params.id})
    // res.json(users)
    const users = await user.find();
    res.json(users)
} )

router.get('/profile/:id', async (req, res) =>{
    //console.log('here')
    const find = await user.findById({_id: req.params.id});
    res.json({usr: find})
} )
module.exports = router