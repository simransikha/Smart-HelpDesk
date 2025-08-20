import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import './ticket-detail.css';

export default function TicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if(loading) return <div className="loading-msg">Loading ticket details...</div>;
  if(error) return <div className="error-msg">{error}</div>;
  if(!ticket) return <div className="empty-msg">Ticket not found.</div>;

  return (
    <div className="ticket-detail-container">
      <h2 className="ticket-title">{ticket.title}</h2>
      <p style={{marginBottom:12}}>{ticket.description}</p>
      <span className="ticket-status" style={{marginBottom:24}}>{ticket.status}</span>

      <h3 style={{marginTop:32, fontWeight:600}}>Conversation</h3>
      <div className="conversation-thread">
        {ticket.messages.map((m,i)=>(
          <div key={i} className="message">
            <strong>{m.sender}:</strong> {m.text}
          </div>
        ))}
      </div>

      {suggestion && (
        <div className="agent-suggestion">
          <strong>Agent Suggestion:</strong>
          <div style={{marginTop:8}}>{suggestion.draftReply}</div>
        </div>
      )}

      <h3 style={{marginTop:32, fontWeight:600}}>Audit Timeline</h3>
      <div className="audit-timeline">
        {audit.map(a => (
          <div key={a._id} className="audit-event">
            {a.action} ({new Date(a.createdAt).toLocaleString()})
          </div>
        ))}
      </div>
    </div>
  );
}
