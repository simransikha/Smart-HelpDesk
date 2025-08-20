import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import AgentSuggestion from '../models/AgentSuggestion.js';
import { runTriage } from '../services/agent/triage.js';

const router = Router();

router.post('/triage', auth(), requireRole('admin','agent'), async (req,res,next)=>{
  try{
    const { ticketId } = req.body;
    if(!ticketId) return res.status(400).json({ error:'ticketId required' });
    const out = await runTriage(ticketId);
    res.json(out);
  }catch(e){ next(e); }
});

router.get('/suggestion/:ticketId', auth(), async (req,res,next)=>{
  try{
    const s = await AgentSuggestion.findOne({ ticket: req.params.ticketId }).populate('citations');
    if(!s) return res.status(404).json({ error:'Not found' });
    res.json(s);
  }catch(e){ next(e); }
});

export default router;
