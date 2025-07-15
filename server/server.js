import express from 'express';
import cors from 'cors';

import 'dotenv/config'
import connectDb from './configs/db.js';
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"
const app=express();
const port=3000;
await connectDb();
//middleware
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware())
app.get('/',(req,res)=>{
    res.send("Radhey Radhey")})
app.use("/api/inngest", serve({ client: inngest, functions }));



    app.listen(port,()=>{
        console.log(`Server  listening at http://localhost:${port}`);
        
    })