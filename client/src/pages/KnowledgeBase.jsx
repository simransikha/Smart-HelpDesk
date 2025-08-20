
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
	const [newTitle, setNewTitle] = useState("");
	const [newContent, setNewContent] = useState("");
	const [newBody, setNewBody] = useState("");
	const [newTags, setNewTags] = useState("");
	const [creating, setCreating] = useState(false);
	const [deleting, setDeleting] = useState("");
	const user = JSON.parse(localStorage.getItem('user') || '{}');

	useEffect(() => {
		API.get("/kb").then(res => setArticles(res.data)).catch(()=>setError("Failed to load KB.")).finally(()=>setLoading(false));
	}, []);

	const [editBody, setEditBody] = useState("");
	const [editTags, setEditTags] = useState("");
	const [editStatus, setEditStatus] = useState("");

	const handleEdit = (article) => {
		setSelected(article);
		setEditContent(article.content);
		setEditBody(article.body || "");
		setEditTags((article.tags || []).join(", "));
		setEditStatus(article.status || "published");
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			await API.put(`/kb/${selected._id}`, {
				title: selected.title,
				content: editContent,
				body: editBody,
				tags: editTags.split(",").map(t=>t.trim()).filter(Boolean),
				status: editStatus
			});
			setArticles(articles.map(a => a._id === selected._id ? { ...a, content: editContent, body: editBody, tags: editTags.split(",").map(t=>t.trim()).filter(Boolean), status: editStatus } : a));
			setSelected(null);
		} catch {
			setError("Failed to save article.");
		} finally {
			setSaving(false);
		}
	};

	const handleCreate = async () => {
		setCreating(true);
		try {
			const res = await API.post('/kb', {
				title: newTitle,
				content: newContent,
				body: newBody,
				tags: newTags.split(",").map(t=>t.trim()).filter(Boolean),
				status: "draft"
			});
			setArticles([...articles, res.data]);
			setNewTitle("");
			setNewContent("");
			setNewBody("");
			setNewTags("");
		} catch {
			setError("Failed to create article.");
		} finally {
			setCreating(false);
		}
	};

	const handleDelete = async (id) => {
		setDeleting(id);
		try {
			await API.delete(`/kb/${id}`);
			setArticles(articles.filter(a => a._id !== id));
		} catch {
			setError("Failed to delete article.");
		} finally {
			setDeleting("");
		}
	};

	return (
		<div className="kb-container">
			<h2 className="kb-header">Knowledge Base</h2>
			{loading && <div className="loading-msg">Loading articles...</div>}
			{error && <div className="error-msg">{error}</div>}
			{user.role === 'admin' && (
				<div className="kb-create-panel">
					<h3>Add New Article</h3>
					<input className="kb-input" type="text" placeholder="Title" value={newTitle} onChange={e=>setNewTitle(e.target.value)} />
					<textarea className="kb-input" placeholder="Content" value={newContent} onChange={e=>setNewContent(e.target.value)} />
					<textarea className="kb-input" placeholder="Body" value={newBody} onChange={e=>setNewBody(e.target.value)} />
					<input className="kb-input" type="text" placeholder="Tags (comma separated)" value={newTags} onChange={e=>setNewTags(e.target.value)} />
					<button className="kb-save-btn" onClick={handleCreate} disabled={creating || !newTitle || !newContent}>
						{creating ? "Creating..." : "Create Article"}
					</button>
				</div>
			)}
			<div className="kb-list">
				{articles.map(article => (
					<div key={article._id} className="kb-item">
						<span>{article.title}</span>
						<button className="kb-edit-btn" onClick={()=>handleEdit(article)}>Edit</button>
						{user.role === 'admin' && (
							<button className="kb-delete-btn" onClick={()=>handleDelete(article._id)} disabled={deleting===article._id} style={{marginLeft:8}}>
								{deleting===article._id ? "Deleting..." : "Delete"}
							</button>
						)}
					</div>
				))}
			</div>
			{selected && (
				<div className="kb-editor">
					<h3>Edit Article: {selected.title}</h3>
					<textarea value={editContent} onChange={e=>setEditContent(e.target.value)} placeholder="Content" />
					<textarea value={editBody} onChange={e=>setEditBody(e.target.value)} placeholder="Body" />
					<input className="kb-input" type="text" value={editTags} onChange={e=>setEditTags(e.target.value)} placeholder="Tags (comma separated)" />
					<select className="kb-input" value={editStatus} onChange={e=>setEditStatus(e.target.value)}>
						<option value="draft">Draft</option>
						<option value="published">Published</option>
					</select>
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
