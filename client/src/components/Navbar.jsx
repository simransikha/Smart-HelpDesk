import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
	const user = JSON.parse(localStorage.getItem('user') || '{}');
	const nav = useNavigate();

	const handleLogout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		nav('/');
	};

	return (
		<nav className="navbar">
			<div className="navbar-left">
				<Link to="/tickets" className="navbar-logo">Smart Helpdesk</Link>
				<Link to="/tickets" className="navbar-link">Tickets</Link>
				<Link to="/kb" className="navbar-link">Knowledge Base</Link>
				<Link to="/settings" className="navbar-link">Settings</Link>
				{user?.role === 'admin' && (
					<Link to="/admin" className="navbar-link">Admin</Link>
				)}
			</div>
			<div className="navbar-right">
				{user?.name ? (
					<>
						<span className="navbar-user">{user.name}</span>
						<button className="navbar-btn" onClick={handleLogout}>Logout</button>
					</>
				) : (
					<Link to="/" className="navbar-btn">Login</Link>
				)}
			</div>
		</nav>
	);
}
