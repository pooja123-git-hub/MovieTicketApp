import express from 'express';
import { getFavourite, getUserBookings, updateFavorite } from '../controllers/userController.js';

const userRouter=express.Router();

userRouter.get('/bookings',getUserBookings);
userRouter.post('/update-favorite',updateFavorite);
userRouter.get('/favourite',getFavourite);


export default userRouter;