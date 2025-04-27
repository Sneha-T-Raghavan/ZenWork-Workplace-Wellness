import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { analyzeJournalEntry, getJournalEntries } from '../controllers/journalController.js';

const journalRouter = express.Router();

journalRouter.post('/analyze', userAuth, analyzeJournalEntry);
journalRouter.get('/entries', userAuth, getJournalEntries);

export default journalRouter;
