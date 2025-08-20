import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/Register";
import Tickets from "./pages/Tickets";
import TicketNew from "./pages/TicketNew";
import TicketDetail from "./pages/TicketDetail";
import KnowledgeBase from "./pages/KnowledgeBase";
import Setting from "./pages/Setting";
import Navbar from "./components/Navbar";
import './index.css';
import './components/navbar.css';
export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
  <Route path="/tickets" element={<Tickets />} />
  <Route path="/tickets/new" element={<TicketNew />} />
  <Route path="/tickets/:id" element={<TicketDetail />} />
        <Route path="/kb" element={<KnowledgeBase />} />
        <Route path="/settings" element={<Setting />} />
      </Routes>
    </BrowserRouter>
  );
}
