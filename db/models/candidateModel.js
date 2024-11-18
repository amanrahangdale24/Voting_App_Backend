
const mongoose = require('mongoose'); 
const candidateSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    party:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true,
    },
    voted:[
        {
            user:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'userModel',
                required:true
            },
            voteAt:{
                type:Date,
                default:Date.now()
            }
        }
    ],
    voteCount:{
        type:Number,
        default:0
    }
    
});

const candidateModel = mongoose.model('candidates', candidateSchema); 

module.exports = candidateModel; 
 
