import { Router } from "express";
import { User } from "../models/User.js";
import { createAccessToken, verifyJWT } from "../middleware/jwtMiddleware.js";
import Candidate from "../models/Candidate.js";

const router = Router();

router.post("/signup", async (req, res) => {

    try {

        // take the user data
        const userData = req.body;
        const { role } = req.body;

        // check the admin
        if (role == "admin") {
            const admin = await User.findOne({ role: "admin" });
            if (role == "admin" && admin.role == role) {
                return res.status(400).json({ Message: "Admin is already existed. Please do not enter as a admin" });
            }
        }

        const {age} = req.body;
        
        if (!userData) {
            return res.status(400).json({ message: "No user data found. Please enter correct details" });
        }

        if(age < 18){
            console.log("You can not vote. You are a minor");
            return res.status(400).json({ Message: "You can not vote. You are a minor" });
        }


        const newUser = new User(userData);

        // response from database
        const response = await newUser.save();
        console.log("Data save in database");

        const payload = {
            _id: response._id,
            name: response.name
        }

        console.log(JSON.stringify(response));

        const token = createAccessToken(payload);
        if (!token) {
            return res.status(400).json({ message: "Invalid details for access token" });
        }


        return res.status(200).json({
            message: "User has been registered",
            token: token
        })

    } catch (error) {
        return res.status(400).json({
            message: error.message
        })
    }

})

// login user
router.post("/login", async (req, res) => {

    const { aadharCardNumber, password } = req.body;

    if (!aadharCardNumber || !password) {
        return res.status(400).json({ message: "User name and password required" });
    }

    const user = await User.findOne({ aadharCardNumber });


    if (!user) {
        return res.status(400).json({ message: "Invalid User" });
    }

    if (password.trim() === "") {
        return res.status(400).json({ message: "Invalid Password" });
    }


    const isPasswordCorrect = await user.comparePassword(password);
    console.log(isPasswordCorrect);

    if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Invalid User" });
    }

    const payload = {
        _id: user._id
    };

    const token = createAccessToken(payload);
    const options = {
        httpOnly: true,
        secure: true
    }

    res.cookie("accessToken", token, options);
    res.status(200).json(token);

})

// logout user

router.post("/logout", verifyJWT, (req, res) => {
    res.clearCookie("accessToken");
    console.log("User has been loged out");
    res.status(200).json({ Message: "User has been loged out sucessfully" });
})

// get user profile

router.get("/changePassword", verifyJWT, async (req, res) => {

    const { password, newPassword } = req.body;

    if (!password && !newPassword) {
        return res.status(401).json({ Message: "Password and new Password both are required" });
    }

    const user = await User.findById(req.user._id);

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        return res.status(401).json({ Message: "Invalid Password" });
    }

    user.password = newPassword;
    await user.save({ ValidateBeforeSave: false });
    console.log("password has been changed sucessfully");

    return res.status(200).json({ Message: "Password has been changed" });

})

// get user profile
router.get("/userProfile", verifyJWT, async (req, res) => {
    const user = await User.findById(req.user._id).select("-password -aadharCardNumber")
    return res.status(200).json({ User: user })
})

router.post("/vote/:candidateId", verifyJWT, async(req, res)=>{

    const candidateId = req.params.candidateId;

    if(!candidateId){
        return res.status(404).json({ Message: "Candidate not found" });
    }

    const candidate = await Candidate.findById(candidateId);
    if(!candidate){
        return res.status(404).json({ Message: "Candidate not found" });
    }

    const userId = req.user._id;
    if(!userId){
        return res.status(404).json({ Message: "Invalid User" });
    }

    const user = await User.findById(userId);
    if(!user){
        return res.status(404).json({ Message: "User not found" });
    }

    if(user.role == "admin"){
        return res.status(400).json({ Message: "Admin can not vote" });
    }

    if(user.isVoted == true){
        return res.status(400).json({ Message: "You can not vote multiple times" });
    }
    candidate.votes.push({user : user._id});
    candidate.voteCount++;
    user.isVoted = true;
    await candidate.save();
    await user.save();

    console.log(`${user.name} is voted for ${candidate.name}`);
    return res.status(200).json({Message : "You have voted sucessfully"});
});

// get candidate list

router.get("/getCandidateList", verifyJWT, async (req, res)=>{
    const list = await Candidate.find({}, {name : 1, party : 1, _id : 0});
    res.status(200).json({CandiateList : list});
})

// get vote count with candidate name  
router.get("/getVoteCount", verifyJWT,async (req, res)=>{
    const voteCountList = await Candidate.find({}, {name : 1, party : 1, voteCount : 1, _id : 0}).sort({voteCount : -1});
    res.status(200).json({voteCountList});
})

export default router;

