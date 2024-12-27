import express from 'express';
import { configDotenv } from 'dotenv';
import bodyParser from 'body-parser';
import connectDB from './DataBase/DB.js';
import userRouter from './Routes/userRoutes.js';
import cookieParser from 'cookie-parser';
import candidateRouter from './Routes/candidateRoute.js';


configDotenv();
const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

app.use(cookieParser())
app.use('/user', userRouter);
app.use("/candidates", candidateRouter);

connectDB().then(()=>{
    app.listen(PORT, ()=>{
        console.log("Server is running on : ", PORT);
    })
})
.catch((error)=>{
    console.log(error.message);
})

