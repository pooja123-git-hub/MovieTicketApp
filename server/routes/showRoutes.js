import express from 'express';
import { getNowPlayingMovie } from '../controllers/showController.js';

const showRouter=express.Router();

showRouter.get('/now-playing',getNowPlayingMovie);

export default showRouter;