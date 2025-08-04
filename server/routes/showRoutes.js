import express from 'express';

import { addShow, getNowPlayingMovie, getShow, getShows } from '../controllers/showController.js';
import { protectAdmin } from '../Middleware/auth.js';
const showRouter=express.Router();

showRouter.get('/now-playing',protectAdmin,getNowPlayingMovie);
showRouter.post('/add',protectAdmin,addShow);
showRouter.get('/all',getShows);
showRouter.get('/:movieId',getShow);

export default showRouter;