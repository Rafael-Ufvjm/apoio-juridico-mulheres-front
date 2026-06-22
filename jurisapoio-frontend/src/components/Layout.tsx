import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function Layout() {
  const { isAuthenticated, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div>
      {/* EMERGENCY BAR */}
      <div className="emergency-bar">
        ⚠️ Em situação de risco imediato? Ligue <a href="tel:180">180 — Central da Mulher</a> ou <a href="tel:190">190 — Polícia</a>
      </div>

      {/* NAV */}
      <nav>
        <div className="nav-inner">
          <Link to="/" className="logo" onClick={closeMenu}>
            <div className="logo-icon"><i className="fas fa-balance-scale"></i></div>
            <div>
              <div className="logo-text">JurisApoio</div>
              <div className="logo-sub">Apoio jurídico gratuito</div>
            </div>
          </Link>

          <button className="menu-toggle" onClick={toggleMenu} aria-label="Menu">
            <i className={`fas ${isMenuOpen ? "fa-times" : "fa-bars"}`}></i>
          </button>

          <div className={`nav-links ${isMenuOpen ? "open" : ""}`}>
            <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""} onClick={closeMenu}>Início</NavLink>
            <NavLink to="/orientacao" className={({ isActive }) => isActive ? "active" : ""} onClick={closeMenu}>Orientação</NavLink>
            {userRole === "admin" ? (
              <NavLink to="/dashboard-admin" className={({ isActive }) => isActive ? "active" : ""} onClick={closeMenu}>Painel Admin</NavLink>
            ) : userRole === "advogado" ? (
              <NavLink to="/dashboard-advogado" className={({ isActive }) => isActive ? "active" : ""} onClick={closeMenu}>Painel do Advogado</NavLink>
            ) : (
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""} onClick={closeMenu}>Minha Área</NavLink>
            )}
            <NavLink to="/sobre" className={({ isActive }) => isActive ? "active" : ""} onClick={closeMenu}>Sobre</NavLink>
            
            {isAuthenticated ? (
              <button 
                onClick={() => { logout(); navigate("/"); closeMenu(); }}
                className="nav-links a btn-logout"
                style={{ 
                  background: "none", 
                  border: "none", 
                  fontSize: "13.5px", 
                  fontWeight: "500", 
                  color: "var(--wine)", 
                  cursor: "pointer",
                  padding: "6px 14px",
                  textAlign: "left"
                }}
              >
                Sair
              </button>
            ) : (
              <Link to="/login" className="nav-links a" style={{ padding: "6px 14px" }} onClick={closeMenu}>Entrar</Link>
            )}

            {userRole !== "advogado" && userRole !== "admin" && (
              <Link to="/dashboard" className="nav-cta btn" onClick={closeMenu}>Solicitar Ajuda</Link>
            )}
            <button 
              onClick={() => { closeMenu(); window.location.replace("https://www.oboticario.com.br/"); }} 
              className="btn-emergency"
              title="Clique para sair rapidamente e ir para o site de O Boticário"
            >
              🚪 Saída de Emergência
            </button>
          </div>
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
