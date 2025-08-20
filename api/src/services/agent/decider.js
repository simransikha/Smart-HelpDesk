import Config from '../../models/Config.js';
import AgentSuggestion from '../../models/AgentSuggestion.js';
import Ticket from '../../models/Ticket.js';
import AuditLog from '../../models/AuditLog.js';

export async function decide({ ticket, suggestion, traceId }){
  const cfg = await Config.findOne({}) || { autoCloseEnabled:true, confidenceThreshold:0.8, thresholds:{} };
  const perCat = cfg.thresholds?.[suggestion.predictedCategory];
  const threshold = typeof perCat === 'number' ? perCat : (cfg.confidenceThreshold || 0.8);

  if(cfg.autoCloseEnabled && suggestion.confidence >= threshold){
    // Auto close: save suggestion, post message, resolve
    await AgentSuggestion.findOneAndUpdate(
      { ticket: ticket._id },
      { $set: {
        ticket: ticket._id,
        draftReply: suggestion.draftReply,
        citations: suggestion.citations,
        predictedCategory: suggestion.predictedCategory,
        confidence: suggestion.confidence,
        traceId
      }},
      { upsert: true }
    );

    ticket.messages.push({ sender:'system', text: suggestion.draftReply });
    ticket.status = 'resolved';
    ticket.category = suggestion.predictedCategory;
    await ticket.save();

    await AuditLog.create({ ticket: ticket._id, action:'AUTO_CLOSED', actor:'system', data:{ confidence:suggestion.confidence }, traceId });
    return { outcome: 'AUTO_CLOSED' };
  }else{
    // Route to human
    ticket.status = 'waiting_human';
    ticket.category = suggestion.predictedCategory;
    await ticket.save();
    await AuditLog.create({ ticket: ticket._id, action:'ASSIGNED_TO_HUMAN', actor:'system', data:{}, traceId });
    return { outcome: 'WAITING_HUMAN' };
  }
}
