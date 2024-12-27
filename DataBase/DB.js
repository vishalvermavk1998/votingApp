import mongoose from "mongoose";

const connectDB =async ()=>{

    try {
    const dataBase = await mongoose.connect(process.env.DB_CONNECTION_STRING);
        console.log("Database has been connected ", dataBase.connection.host);
    } catch (error) {
        console.log("Error in database connection and error is : ", error);
        process.exit(1);
    }
}

export default connectDB;