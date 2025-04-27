import express from 'express';
import { 
  saveDrawing, 
  getUserDrawings, 
  getDrawingById, 
  deleteDrawing 
} from '../controllers/pixelController.js';
import userAuth from '../middleware/userAuth.js';

const router = express.Router();

// Protected routes (require authentication)
router.post('/save', userAuth, saveDrawing);
router.get('/list', userAuth, getUserDrawings);
router.get('/:id', userAuth, getDrawingById);
router.delete('/:id', userAuth, deleteDrawing);

export default router;