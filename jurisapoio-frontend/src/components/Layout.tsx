import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function Layout() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      {/* EMERGENCY BAR */}
      <div className="emergency-bar">
        ⚠️ Em situação de risco imediato? Ligue <a href="tel:180">180 — Central da Mulher</a> ou <a href="tel:190">190 — Polícia</a>
      </div>

      {/* NAV */}
      <nav>
        <div className="nav-inner">
          <Link to="/" className="logo">
            <div className="logo-icon"><i className="fas fa-balance-scale"></i></div>
            <div>
              <div className="logo-text">JurisApoio</div>
              <div className="logo-sub">Apoio jurídico gratuito</div>
            </div>
          </Link>
          <div className="nav-links">
            <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>Início</NavLink>
            <NavLink to="/lawyers" className={({ isActive }) => isActive ? "active" : ""}>Advogados</NavLink>
            <NavLink to="/orientacao" className={({ isActive }) => isActive ? "active" : ""}>Orientação</NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>Minha Área</NavLink>
            <NavLink to="/chat" className={({ isActive }) => isActive ? "active" : ""}>Chat Seguro</NavLink>
            <NavLink to="/sobre" className={({ isActive }) => isActive ? "active" : ""}>Sobre</NavLink>
            <NavLink to="/seguranca" className={({ isActive }) => isActive ? "active" : ""}>Segurança</NavLink>
            
            {isAuthenticated ? (
              <button 
                onClick={() => { logout(); navigate("/"); }}
                className="nav-links a"
                style={{ 
                  background: "none", 
                  border: "none", 
                  fontSize: "13.5px", 
                  fontWeight: "500", 
                  color: "var(--wine)", 
                  cursor: "pointer",
                  padding: "6px 14px"
                }}
              >
                Sair
              </button>
            ) : (
              <Link to="/login" className="nav-links a" style={{ padding: "6px 14px" }}>Entrar</Link>
            )}

            <Link to="/dashboard" className="nav-cta btn">Solicitar Ajuda</Link>
            <button 
              onClick={() => window.location.replace("https://www.oboticario.com.br/")} 
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
