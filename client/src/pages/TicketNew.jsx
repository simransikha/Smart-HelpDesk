import React, { useState } from 'react';
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import './tickets.css';

export default function TicketNew() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [attachments, setAttachments] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await API.post("/tickets", {
        title,
        description,
        category,
        attachments: attachments.split(',').map(a=>a.trim()).filter(Boolean)
      });
      nav("/tickets");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create ticket.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tickets-container">
      <h2 className="tickets-header">Create New Ticket</h2>
      {error && <div className="error-msg">{error}</div>}
      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="form-group">
          <label className="form-label" htmlFor="title">Title</label>
          <input className="form-input" type="text" id="title" value={title} onChange={e=>setTitle(e.target.value)} required autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="description">Description</label>
          <textarea className="form-input" id="description" value={description} onChange={e=>setDescription(e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="category">Category</label>
          <select className="form-input" id="category" value={category} onChange={e=>setCategory(e.target.value)}>
            <option value="billing">Billing</option>
            <option value="tech">Tech</option>
            <option value="shipping">Shipping</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="attachments">Attachments (URLs, comma separated)</label>
          <input className="form-input" type="text" id="attachments" value={attachments} onChange={e=>setAttachments(e.target.value)} placeholder="https://..." />
        </div>
        <button className="form-btn" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Ticket"}
        </button>
      </form>
    </div>
  );
}
