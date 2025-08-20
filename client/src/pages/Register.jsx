import React, { useState } from 'react';
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import './login-register.css';

export default function Register() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState("user");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);
	const nav = useNavigate();

	const handleRegister = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess("");
		try {
			const { data } = await API.post("/auth/register", { name, email, password, role });
			setSuccess("Registration successful! You can now login.");
			setTimeout(() => nav("/"), 1500);
		} catch (err) {
			setError(err.response?.data?.error || "Registration failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="register-container">
			<h2 className="register-title">Create Account</h2>
			<p className="login-subtitle">Sign up for your helpdesk account</p>
			{error && <div className="error-msg">{error}</div>}
			{success && <div className="success-msg">{success}</div>}
			<form onSubmit={handleRegister} autoComplete="off">
				<div className="form-group">
					<label className="form-label" htmlFor="name">Name</label>
					<input className="form-input" type="text" id="name" name="name" value={name} onChange={e=>setName(e.target.value)} required autoFocus />
				</div>
				<div className="form-group">
					<label className="form-label" htmlFor="email">Email</label>
					<input className="form-input" type="email" id="email" name="email" value={email} onChange={e=>setEmail(e.target.value)} required />
				</div>
				<div className="form-group">
					<label className="form-label" htmlFor="password">Password</label>
					<input className="form-input" type="password" id="password" name="password" value={password} onChange={e=>setPassword(e.target.value)} required />
				</div>
				<div className="form-group">
					<label className="form-label" htmlFor="role">Role</label>
					<select className="form-input" id="role" name="role" value={role} onChange={e=>setRole(e.target.value)} required>
						<option value="user">User</option>
						<option value="agent">Agent</option>
						<option value="admin">Admin</option>
					</select>
				</div>
				<button className="form-btn" type="submit" disabled={loading}>
					{loading ? "Registering..." : "Register"}
				</button>
			</form>
			<div className="login-footer">
				<span>Already have an account?</span>
				<a className="login-link" href="/">Login</a>
			</div>
		</div>
	);
}
