const express = require('express'); 
const app = express(); 
const dotenv = require('dotenv')
dotenv.config() ;
const connectToDB = require('./db/config/connection'); 
connectToDB(); 
const userRouter = require('./routes/user.routes')
const candidateRouter = require('./routes/candidate.routes')
const cookieParser = require('cookie-parser'); 



app.use(cookieParser()); 
app.use(express.json());
app.use('/user', userRouter); 
app.use('/candidate',candidateRouter);






const port = process.env.PORT || 4044; 
app.listen(port); 


