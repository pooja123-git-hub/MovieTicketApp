// import express from 'express';
// import cors from 'cors';
// import 'dotenv/config.js';
// import connectDb from './configs/db.js';
// import { clerkMiddleware } from '@clerk/express';
// import { serve } from "inngest/express";
// import { inngest, functions } from "./inngest/index.js";
// import showRouter from './routes/showRoutes.js';

// const app = express();

// // Middleware
// app.use(express.json());
// app.use(cors());
// app.use(clerkMiddleware());

// // Routes
// app.get('/', (req, res) => {
//   res.send("Radhey Radhey");
// });

// app.use("/api/inngest", serve({ client: inngest, functions }));
// app.use('/api/show',showRouter);

// connectDb();

// export default app;
// index.js or server.js

import express from 'express';
import cors from 'cors';
import 'dotenv/config.js';
import connectDb from './configs/db.js';
import { clerkMiddleware } from '@clerk/express';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import showRouter from './routes/showRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import userRouter from './routes/userRoutes.js';

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
app.use('/api/show', showRouter);
app.use('/api/booking',bookingRouter);
app.use('/api/admin',adminRouter);
app.use('/api/user',userRouter);

// Start DB and Server together
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDb(); // ensure DB is connected
    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
