import React, { useEffect, useState } from 'react';
import API from "../services/api";
import './kb.css';

export default function KnowledgeBase() {
	const [articles, setArticles] = useState([]);
	const [selected, setSelected] = useState(null);
	const [editContent, setEditContent] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		API.get("/kb").then(res => setArticles(res.data)).catch(()=>setError("Failed to load KB.")).finally(()=>setLoading(false));
	}, []);

	const handleEdit = (article) => {
		setSelected(article);
		setEditContent(article.content);
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			await API.put(`/kb/${selected._id}`, { content: editContent });
			setArticles(articles.map(a => a._id === selected._id ? { ...a, content: editContent } : a));
			setSelected(null);
		} catch {
			setError("Failed to save article.");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="kb-container">
			<h2 className="kb-header">Knowledge Base</h2>
			{loading && <div className="loading-msg">Loading articles...</div>}
			{error && <div className="error-msg">{error}</div>}
			<div className="kb-list">
				{articles.map(article => (
					<div key={article._id} className="kb-item">
						<span>{article.title}</span>
						<button className="kb-edit-btn" onClick={()=>handleEdit(article)}>Edit</button>
					</div>
				))}
			</div>
			{selected && (
				<div className="kb-editor">
					<h3>Edit Article: {selected.title}</h3>
					<textarea value={editContent} onChange={e=>setEditContent(e.target.value)} />
					<button className="kb-save-btn" onClick={handleSave} disabled={saving}>
						{saving ? "Saving..." : "Save"}
					</button>
					<button className="kb-edit-btn" style={{marginLeft:12}} onClick={()=>setSelected(null)}>Cancel</button>
				</div>
			)}
			{!loading && articles.length === 0 && <div className="empty-msg">No articles found.</div>}
		</div>
	);
}
