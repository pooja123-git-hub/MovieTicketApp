import express from 'express';
import { protectAdmin } from '../Middleware/auth.js';
import { getAllBookings, getAllShows, getdashboardData, isAdmin } from '../controllers/adminController.js';

const adminRouter=express.Router();

adminRouter.get('/is-admin',protectAdmin,isAdmin)
adminRouter.get('/dashboard',protectAdmin,getdashboardData);
adminRouter.get('/all-shows',protectAdmin,getAllShows);
adminRouter.get('/all-bookings',protectAdmin,getAllBookings);

export default adminRouter;