import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/auth.js';
import kbRoutes from './routes/kb.js';
import ticketRoutes from './routes/tickets.js';
import agentRoutes from './routes/agent.js';
import configRoutes from './routes/config.js';
import auditRoutes from './routes/audit.js';

import { errorHandler } from './middleware/error.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({limit:'1mb'}));
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*'}));
app.use(morgan('dev'));

app.get('/healthz', (req,res)=>res.json({ ok:true }));

app.use('/api/auth', authRoutes);
app.use('/api/kb', kbRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/config', configRoutes);
app.use('/api', auditRoutes); 

app.use(errorHandler);

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/helpdesk';
mongoose.connect(uri).then(()=>{
  console.log('Mongo connected');
  app.listen(PORT, ()=>console.log('API listening on '+PORT));
}).catch(err=>{
  console.error('Mongo error', err);
  process.exit(1);
});
