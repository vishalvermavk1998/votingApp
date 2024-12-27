import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = mongoose.Schema({

    name: {
        type : String,
        required : true
    },
    age: {
        type : Number,
        required : true
    },
    email: {
        type : String,
        
    },
    aadharCardNumber: {
        type : Number,
        required : true,
        unique : true
    },
    password: {
        type : String,
        required : true
    },
    mobile: {
        type : String,
    },
    role : {
        type : String,
        enum : ['voter', 'admin'],
        default : 'voter'
    },
    isVoted: {
        type : Boolean,
        default : false
    }
});


userSchema.pre("save", async function (next){

    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})



userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
} 

export  const User = mongoose.model("User", userSchema);
 