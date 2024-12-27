import { Router } from "express";
import { User } from "../models/User.js";
import { verifyJWT } from "../middleware/jwtMiddleware.js";
import Candidate from "../models/Candidate.js";

const candidateRouter = Router();

const isUserIsAdmin = async (userId) => {
    const user = await User.findById(userId);
    return user.role == "admin";
}

// create candidate details
candidateRouter.post("/createCandidate", verifyJWT, async (req, res) => {
    const isAdmin = await isUserIsAdmin(req.user._id);

    if (!isAdmin) {
        return res.status(400).json({ Message: "This can do only admin" });
    }

    const candidateData = req.body;
    console.log(candidateData);
    if (!candidateData) {
        return res.status(400).json({ Message: "Please enter valid details" });
    }

    const candidate = new Candidate(candidateData);
    await candidate.save();
    console.log("Candidate data has been saved");

    return res.status(200).json({ Message: "Candidate has been saved", candidate });

});

// update candidate details
candidateRouter.put("/updateCandidate/:candidateId", verifyJWT, async (req, res) => {

    const isAdmin = await isUserIsAdmin(req.user._id);

    if (!isAdmin) {
        return res.status(400).json({ Message: "This can do only admin" });
    }

    const candidateId = req.params.candidateId;

    const candidate = await Candidate.findById(candidateId);

    if (!candidate) {
        return res.status(404).json({ Message: " Candidate not found" });
    }

    const { party } = req.body;

    candidate.party = party;
    await candidate.save();

    const newCandidate = await Candidate.findById(candidateId).select("-votes -voteCount");

    return res.status(200).json({ Message: "Candidate details has been updated", newCandidate });
})

// delete candidate

candidateRouter.delete("/deleteCandidate/:candidateId", verifyJWT,async (req, res) => {
    const isAdmin = await isUserIsAdmin(req.user._id);

    if (!isAdmin) {
        return res.status(400).json({ Message: "This can do only admin" });
    }
 
    const candidateId = req.params.candidateId;

    if(!candidateId){
        return res.status(404).json({ Message: "Candidate not found" });
    }

    const candidate = await Candidate.findById(candidateId);
    if(!candidate){
        return res.status(404).json({ Message: "Candidate not found" });
    }

    const response = await Candidate.deleteOne(candidate._id);
    console.log(response);
    console.log("Canidate informations have been deleted");

    return res.status(200).json({Message : "Candidate has been deleted", response : response});

})






export default candidateRouter;