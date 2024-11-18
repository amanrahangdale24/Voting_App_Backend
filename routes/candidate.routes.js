const express = require('express');
const router = express.Router();
const userModel = require('../db/models/userModel');
const candidateModel = require('../db/models/candidateModel');

const authMiddleware = require('../middleware/auth');



const isAdmin = async(id)=>{
    try{
        const user = await userModel.findById(id); 
       
        return user.role === 'admin';
    }catch(error){
        return false; 
    }
}



// route to register a condidate 
router.post('/registerCandidate',authMiddleware, 
    async (req, res) => {

        if(!await isAdmin(req.user.userId)){
            return res.status(403).json({
                error: "Role is not admin"
            })
        }

        const { name, age, party,voted, voteCount } = req.body;

        const newCandidate = await candidateModel.create({
            name,
            age,
            party,
            voted,
            voteCount
        })

        res.status(200).json(newCandidate);
    })



// route to update a condidate 

router.put('/updateCandidate/:CandidateId', authMiddleware,async(req,res)=>{
    try{
        if(! await isAdmin(req.user.userId)){
            return res.status(403).json({
                error: "Role is not admin"
            })
        }


        const candidateId = req.params.CandidateId; 
        const updatingCandidate = req.body; 

        const response = await candidateModel.findByIdAndUpdate(candidateId, updatingCandidate, {
            new: true,
            runValidators: true
        });

        if(!response){
            return res.status(404).json({error:"candidate not found"}); 
        }
        res.status(200).json(response);
        
    }catch(error){
        return res.status(404).json({
            error: "Candidate Not found"
        })
    }

    
})

// route to delete  a condidate 
router.delete('/deleteCandidate/:CandidateId',authMiddleware, async(req,res)=>{
    try{
        if(! await isAdmin(req.user.userId)){
            return res.status(403).json({
                error: "Role is not admin"
            })
        }

        const candidateId = req.params.CandidateId; 

        const response = await candidateModel.findByIdAndDelete(candidateId); 

        if(!response){
            return res.status(404).json({error:"candidate not found"}); 
        }

        res.send("candidate deleted"); 
    }catch(error){
        return res.status(403).json({
            error: "Role is not admin"
        })
    }
})


// route to vote a candidate 

router.put('/vote/:candiateId', authMiddleware, async(req,res)=>{
     try{
        const candiateId = req.params.candiateId; 
        const userId = req.user.userId; 

        const candidate = await candidateModel.findById(candiateId); 

        if(!candidate){
            return res.status(403).json({
                message: "candiate not found"
            })
        }

        const user = await userModel.findById(userId); 

        if(!user){
            return res.status(403).json({
                message: "user not found"
            })
        }

        if(user.isVoted){
            return res.status(403).json({
                message: "user cant vote again"
            })
        }

        if(user.role === 'admin'){
            return res.status(403).json({
                message: "admin can not vote"
            })
        }

        candidate.voted.push({user: userId}); 
        candidate.voteCount++; 

        await candidate.save(); 

        user.isVoted = true; 
        await user.save(); 

        res.status(200).json(candidate);

     }catch(err){
        return res.status(403).json({
            error: "Something went  wrong"
        })
     }
})

router.get('/vote/count', async(req,res)=>{
    try{
        const candidate = await candidateModel.find().sort({voteCount: 'desc'}); 

        //list the candidate 

        const record = candidate.map((data)=>{
            return {
                party: data.party,
                count : data.voteCount
            }
        })

        res.status(200).json(record); 
    }catch(error){
        return res.status(403).json({
            error: "Something went wrong"
        })
    }
})


module.exports = router; 