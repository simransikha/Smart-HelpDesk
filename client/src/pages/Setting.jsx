import React, { useEffect, useState } from 'react';
import API from "../services/api";
import './settings.css';

export default function Setting() {
	const [config, setConfig] = useState({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [saving, setSaving] = useState(false);
	const [success, setSuccess] = useState("");

	useEffect(() => {
		API.get("/config").then(res => setConfig(res.data)).catch(()=>setError("Failed to load settings.")).finally(()=>setLoading(false));
	}, []);

	const handleChange = (e) => {
		setConfig({ ...config, [e.target.name]: e.target.value });
	};

	const handleSave = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError("");
		setSuccess("");
		try {
			await API.put("/config", config);
			setSuccess("Settings saved successfully.");
		} catch {
			setError("Failed to save settings.");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="settings-container">
			<h2 className="settings-title">Settings</h2>
			{loading && <div className="loading-msg">Loading settings...</div>}
			{error && <div className="error-msg">{error}</div>}
			{success && <div className="success-msg">{success}</div>}
			{!loading && (
				<form onSubmit={handleSave} autoComplete="off">
					<div className="settings-group">
						<label className="settings-label" htmlFor="siteName">Site Name</label>
						<input className="settings-input" type="text" id="siteName" name="siteName" value={config.siteName || ""} onChange={handleChange} />
					</div>
					<div className="settings-group">
						<label className="settings-label" htmlFor="supportEmail">Support Email</label>
						<input className="settings-input" type="email" id="supportEmail" name="supportEmail" value={config.supportEmail || ""} onChange={handleChange} />
					</div>
					<button className="settings-btn" type="submit" disabled={saving}>
						{saving ? "Saving..." : "Save Settings"}
					</button>
				</form>
			)}
		</div>
	);
}
