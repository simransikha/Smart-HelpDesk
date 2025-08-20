import { v4 as uuidv4 } from 'uuid';
import AgentSuggestion from '../../models/AgentSuggestion.js';
import Ticket from '../../models/Ticket.js';
import AuditLog from '../../models/AuditLog.js';

import { plan } from './planner.js';
import { classify } from './classifier.js';
import { retrieveKB } from './retriever.js';
import { draft } from './drafter.js';
import { decide } from './decider.js';

export async function runTriage(ticketId){
  const ticket = await Ticket.findById(ticketId);
  if(!ticket) throw new Error('ticket not found');
  const traceId = uuidv4();

  await AuditLog.create({ ticket: ticket._id, action:'TRIAGE_STARTED', actor:'system', data:{ plan: plan() }, traceId });

  const { predictedCategory, confidence } = classify(ticket.title + ' ' + ticket.description);
  await AuditLog.create({ ticket: ticket._id, action:'AGENT_CLASSIFIED', actor:'system', data:{ predictedCategory, confidence }, traceId });

  const kb = await retrieveKB(ticket.title + ' ' + ticket.description);
  await AuditLog.create({ ticket: ticket._id, action:'KB_RETRIEVED', actor:'system', data:{ kbIds: kb.map(a=>a._id) }, traceId });

  const { draftReply, citations } = draft({ text: ticket.description, articles: kb });
  await AuditLog.create({ ticket: ticket._id, action:'DRAFT_GENERATED', actor:'system', data:{}, traceId });

  // For visibility, save (or upsert) suggestion regardless of outcome
  await AgentSuggestion.findOneAndUpdate(
    { ticket: ticket._id },
    { $set: { ticket: ticket._id, draftReply, citations, predictedCategory, confidence, traceId } },
    { upsert: true }
  );

  const outcome = await decide({ ticket, suggestion:{ draftReply, citations, predictedCategory, confidence }, traceId });
  await AuditLog.create({ ticket: ticket._id, action:'TRIAGE_FINISHED', actor:'system', data:{ outcome }, traceId });

  return { traceId, predictedCategory, confidence, outcome };
}
