const express = require('express');
const router = express.Router();

const userModel = require('../db/models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authMiddleware = require('../middleware/auth')

const { validationResult, body } = require('express-validator');




router.post('/register',
    body('name').trim().isLength({ min: 5 }),
    body('email').trim().isEmail(),
    body('mobile').trim().isLength({ min: 10 }),
    body('address').trim().isLength({ min: 3 }),
    body('aadharCardNumber').trim().isLength({ min: 12 }),
    body('password').trim().isLength({ min: 3 }),

    async (req, res) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(400).json({
                error: error,
                message: "Invalid entries"
            })
        }

        const { name, age, mobile, email, address, aadharCardNumber, password, role, isVoted } = req.body;


        // check we should have only one admin 
        const data  = req.body; 
        const adminUser = await userModel.findOne({role:'admin'}); 

        if(data.role === 'admin' && adminUser){
            return res.status(403).json({
                error: "You can not register as admin"
            })
        }


        const hashPass = await bcrypt.hash(password, 10);

        const newUser = await userModel.create({
            name,
            age,
            mobile,
            email,
            address,
            aadharCardNumber,
            password: hashPass,
            role,
            isVoted
        })

        res.status(200).json(newUser);

    })


router.post('/login',
    body('aadharCardNumber').trim().isLength({ min: 12 }),
    body('password').trim().isLength({ min: 3 }),
    async (req,res)=>{
        const error = validationResult(req); 
        if (!error.isEmpty()) {
            return res.status(400).json({
                error: error,
                message: "Invalid entries"
            })
        }

        const {aadharCardNumber,password} = req.body; 

        const user = await userModel.findOne({
            aadharCardNumber:aadharCardNumber
        })

        if(!user){
            return res.status(404).json({
                message:"User Not Found"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(404).json({
                message:"User Not Found"
            })
        }


        // if everyThing matched 

        const token = jwt.sign({
            userId : user._id,
            aadharCardNumber : user.aadharCardNumber,
            password: user.password
        },process.env.SECRET_KEY)

        res.cookie(token); 
        res.send(token)
        
        
        
    }
 )


 // now profile get route


router.get('/profile', authMiddleware,async(req,res)=>{
    try{
        const userId = req.user.userId; 
        const userFound = await userModel.findById(userId);
        res.status(200).json(userFound); 
    }catch(error){
        res.status(404).json({
            error: "user not found"
        })
    }
})


// now profile/password put method to change the password ; 

router.put('/profile/password', authMiddleware, async(req,res)=>{
    const userId = req.user.userId; 
    const {currentPass, newPass} = req.body; 

    // check the current pass 
    const userFound = await userModel.findById(userId);
    const isMatch = await bcrypt.compare(currentPass, userFound.password); 
    if(!isMatch){
        return res.status(404).json({
            errror: "Please enter correct password"
        })
    }

    // if everything okay 

    const hashedNewPass = bcrypt.hash(newPass, 10); 
    userFound.password = hashedNewPass; 

    res.send("password updated")

})







module.exports = router; 