import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const verifyJWT = async (req, res, next)=>{
    try {
        
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if(!token){
            return res.status(401).json({message : "Unauthorized request"});
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id);

        
        if(!user){
            return res.status(401).json({message : "Invalid access token"});
        };

        req.user = user;
        next();

    } catch (error) {
        res.status(401).json({message : error.message || "Invalid Acces Token"});
    }
}

export const createAccessToken = (userData)=>{
    return jwt.sign(userData, process.env.ACCESS_TOKEN_SECRET, {expiresIn : "1h"});
};