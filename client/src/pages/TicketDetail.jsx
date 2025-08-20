

import './ticket-detail.css';
import { useState, useEffect } from 'react';
import { FaUser, FaRobot, FaEdit, FaCheckCircle, FaTimesCircle, FaReply } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import API from '../services/api';
import { useNotification } from '../components/NotificationProvider.jsx';

export default function TicketDetail() {


  const { id } = useParams();
  const { showNotification } = useNotification();
  const [ticket, setTicket] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [reply, setReply] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [resolveLoading, setResolveLoading] = useState(false);
  const [timelineCollapsed, setTimelineCollapsed] = useState(false);

  useEffect(() => {
    Promise.all([
      
        API.get(`/tickets/${id}`),
      API.get(`/agent/suggestion/${id}`).catch(()=>({data:null})),
      API.get(`/tickets/${id}/audit`)
    ])
      .then(([ticketRes, suggestionRes, auditRes]) => {
        setTicket(ticketRes.data);
        setSuggestion(suggestionRes.data);
        setAudit(auditRes.data);
      })
      .catch(() => setError("Failed to load ticket details."))
      .finally(() => setLoading(false));
  }, [id]);

  // ...removed duplicate handleReply...

  const handleReply = async (e) => {
    e.preventDefault();
    setReplyLoading(true);
    try {
      await API.post(`/tickets/${id}/reply`, { text: reply });
      setReply("");
      showNotification("Reply sent!", "success");
      // Reload ticket details
      const ticketRes = await API.get(`/tickets/${id}`);
      setTicket(ticketRes.data);
    } catch {
      showNotification("Failed to send reply.", "error");
    } finally {
      setReplyLoading(false);
    }
  };
  return (
    <div className="ticket-detail-container">
      <h2 className="ticket-title">{ticket.title}</h2>
      <p style={{marginBottom:12}}>{ticket.description}</p>
      <span className="ticket-status" style={{marginBottom:24}}>{ticket.status}</span>

      <h3 style={{marginTop:32, fontWeight:600}}>Conversation</h3>
      <div className="conversation-thread">
        {ticket.messages.map((m,i)=>(
          <div key={i} className={`message ${m.sender === 'agent' ? 'message-agent' : 'message-user'}`}>
            <span style={{fontWeight:600, color: m.sender === 'agent' ? '#2563eb' : '#374151'}}>
              {m.sender === 'agent' ? 'Agent' : 'You'}:
            </span>
            <span style={{marginLeft:8}}>{m.text}</span>
          </div>
        ))}
      </div>
      {user.role === 'agent' && (
        <div style={{marginTop:24}}>
          {suggestion && suggestion.draftReply && (
            <div className="agent-suggestion" style={{background:'#f3f4f6', padding:16, borderRadius:8, marginBottom:16}}>
              <strong>Agent Suggestion:</strong>
              <textarea
                className="form-input"
                style={{marginTop:8, minHeight:60}}
                value={reply || suggestion.draftReply}
                onChange={e => setReply(e.target.value)}
              />
              <div style={{display:'flex', gap:8, marginTop:8}}>
                <button
                  className="form-btn"
                  type="button"
                  disabled={replyLoading}
                  onClick={() => {
                    setReply(suggestion.draftReply);
                    showNotification('Draft accepted!', 'info');
                  }}
                >Accept Draft</button>
                <button
                  className="form-btn"
                  type="button"
                  disabled={replyLoading}
                  onClick={() => setReply("")}
                >Clear</button>
              </div>
            </div>
          )}
          <form onSubmit={handleReply}>
            <label className="form-label" htmlFor="reply">Reply</label>
            <textarea
              className="form-input"
              id="reply"
              value={reply}
              onChange={e => setReply(e.target.value)}
              required
              style={{minHeight:60}}
            />
            <button className="form-btn" type="submit" disabled={replyLoading} style={{marginTop:8}}>
              {replyLoading ? "Sending..." : "Send Reply"}
            </button>
          </form>
          <div style={{display:'flex', gap:12, marginTop:16}}>
            {ticket && ticket.status === 'resolved' ? (
              <button className="form-btn" type="button" onClick={async () => {
                // Reopen ticket
                try {
                  await API.post(`/tickets/${id}/reopen`);
                  showNotification('Ticket reopened!', 'success');
                  const ticketRes = await API.get(`/tickets/${id}`);
                  setTicket(ticketRes.data);
                } catch {
                  showNotification('Failed to reopen ticket.', 'error');
                }
              }}>Reopen Ticket</button>
            ) : (
              <button className="form-btn" type="button" onClick={async () => {
                // Close ticket
                try {
                  await API.post(`/tickets/${id}/close`);
                  showNotification('Ticket closed!', 'success');
                  const ticketRes = await API.get(`/tickets/${id}`);
                  setTicket(ticketRes.data);
                } catch {
                  showNotification('Failed to close ticket.', 'error');
                }
              }}>Close Ticket</button>
            )}
          </div>
        </div>
      )}

      <h3 style={{marginTop:32, fontWeight:600}}>Audit Timeline</h3>
      <div className="audit-timeline" style={{marginBottom:24}}>
        <button
          onClick={() => setTimelineCollapsed(v => !v)}
          style={{marginBottom:12, padding:'4px 12px', borderRadius:6, background:'#e5e7eb', border:'none', cursor:'pointer'}}
        >
          {timelineCollapsed ? 'Show Timeline' : 'Hide Timeline'}
        </button>
        {!timelineCollapsed && (
          <ul style={{listStyle:'none', padding:0}}>
            {audit.length > 0 ? audit.map(a => {
              const icon = {
                'created': <FaUser style={{color:'#3b82f6'}} title="Created" />,
                'updated': <FaEdit style={{color:'#f59e42'}} title="Updated" />,
                'closed': <FaCheckCircle style={{color:'#22c55e'}} title="Closed" />,
                'auto-closed': <FaRobot style={{color:'#a78bfa'}} title="Auto-Closed" />,
                'agent-reply': <FaReply style={{color:'#6366f1'}} title="Agent Reply" />,
                'error': <FaTimesCircle style={{color:'#ef4444'}} title="Error" />,
              }[a.action] || <FaUser style={{color:'#6b7280'}} title={a.action} />;
              const color = {
                'created': '#dbeafe',
                'updated': '#fef3c7',
                'closed': '#dcfce7',
                'auto-closed': '#ede9fe',
                'agent-reply': '#e0e7ff',
                'error': '#fee2e2',
              }[a.action] || '#f3f4f6';
              return (
                <li key={a._id} style={{background:color, borderLeft:'4px solid #e5e7eb', marginBottom:8, borderRadius:8, boxShadow:'0 1px 4px #0001', display:'flex', alignItems:'center', gap:12, padding:'10px 16px'}}>
                  <span>{icon}</span>
                  <span style={{fontSize:12, color:'#6b7280', fontFamily:'monospace'}}>{new Date(a.createdAt).toLocaleString()}</span>
                  <span style={{fontWeight:600, textTransform:'capitalize'}}>{a.action.replace('-', ' ')}</span>
                  <span style={{color:'#374151'}}>{a.user}</span>
                  {a.details && <span style={{color:'#4b5563'}}>{a.details}</span>}
                </li>
              );
            }) : <li>No timeline events yet.</li>}
          </ul>
        )}
      </div>
    </div>
  )
}


 
