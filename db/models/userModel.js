const mongoose = require('mongoose'); 
const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    age:{
        type:Number
    },
    mobile:{
        type:String,
    },
    email:{
        type:String
    },
    address:{
        type:String,
        required:true
    }, 
    aadharCardNumber:{
        type:Number,
        required:true,
        unique:true
    },
    password:{
        type:String,
        require:true
    },
    role:{
        type:String,
        enum:['voter', 'admin'],
        default:"voter"
    },
    isVoted:{
        type:Boolean,
        default:true
    }

});


const userModel = mongoose.model('users', userSchema); 

module.exports = userModel; 
