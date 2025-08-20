
import { useEffect, useState } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";
import './tickets.css';

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/tickets")
      .then(res => setTickets(res.data))
      .catch(() => setError("Failed to load tickets."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="tickets-container">
      <h2 className="tickets-header">My Tickets</h2>
      <Link to="/tickets/new" className="form-btn" style={{maxWidth:200, display:'inline-block', marginBottom:20}}>
        + New Ticket
      </Link>
      {loading && <div className="loading-msg">Loading tickets...</div>}
      {error && <div className="error-msg">{error}</div>}
      <ul className="ticket-list">
        {tickets.map(t => (
          <li key={t._id} className="ticket-item">
            <Link to={`/tickets/${t._id}`} className="ticket-link">{t.title}</Link>
            <span className="ticket-status">{t.status}</span>
          </li>
        ))}
      </ul>
      {!loading && tickets.length === 0 && <div className="empty-msg">No tickets found.</div>}
    </div>
  );
}
