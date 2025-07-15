import express from 'express';
import cors from 'cors';
import 'dotenv/config.js';
import connectDb from './configs/db.js';
import { clerkMiddleware } from '@clerk/express';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

// Routes
app.get('/', (req, res) => {
  res.send("Radhey Radhey");
});

app.use("/api/inngest", serve({ client: inngest, functions }));


connectDb();

export default app;
