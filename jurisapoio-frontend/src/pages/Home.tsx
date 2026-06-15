import { Link } from "react-router-dom";

export function Home() {
  return (
    <div className="page active" id="page-home">
      {/* HERO */}
      <div className="hero">
        <div className="hero-badge">
          <i className="fas fa-shield-alt"></i> Confidencial · Gratuito · Seguro
        </div>
        <h1>Você não está sozinha.<br />Temos advogados prontos para te ajudar.</h1>
        <p>Conectamos vítimas de violência contra a mulher com advogados voluntários especializados, de forma gratuita, confidencial e 100% segura.</p>
        <div className="hero-btns">
          <Link className="btn btn-primary" to="/dashboard">
            <i className="fas fa-hands-helping"></i> Solicitar Ajuda Agora
          </Link>
          <button 
            onClick={() => window.location.replace("https://www.oboticario.com.br/")} 
            className="btn-emergency-hero"
            title="Clique para sair rapidamente e ir para o site de O Boticário"
          >
            <i className="fas fa-door-open"></i> Saída de Emergência
          </button>
          <Link className="btn btn-outline" to="/orientacao">
            <i className="fas fa-book-open"></i> Conhecer Meus Direitos
          </Link>
        </div>

      </div>

      {/* HOW IT WORKS */}
      <section style={{ background: "var(--white)" }}>
        <div className="section-inner">
          <div className="section-tag">Como funciona</div>
          <h2 className="section-title">Simples, rápido e seguro</h2>
          <p className="section-sub">Em poucos passos você tem acesso a orientação jurídica especializada, sem burocracia.</p>
          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <h3>Cadastro anônimo</h3>
              <p>Crie sua conta usando apenas um apelido. Não pedimos CPF nem nome completo na etapa inicial. Sua segurança vem primeiro.</p>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <h3>Descreva sua situação</h3>
              <p>Responda a um formulário guiado sobre o que aconteceu. O sistema classifica e direciona para o profissional mais adequado.</p>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <h3>Conecte-se ao advogado</h3>
              <p>Um advogado voluntário especializado entra em contato via chat seguro e criptografado em até 24 horas.</p>
            </div>
            <div className="step">
              <div className="step-num">4</div>
              <h3>Acompanhe seu caso</h3>
              <p>Acompanhe o andamento pelo painel, envie documentos e receba atualizações sobre seu processo em linguagem simples.</p>
            </div>
          </div>
        </div>
      </section>

      {/* BANNER */}
      <section style={{ background: "var(--warm)" }}>
        <div className="section-inner">
          <div className="banner">
            <div className="banner-icon">⚖️</div>
            <div>
              <h2>A justiça é um direito de todas.<br />Não de quem pode pagar.</h2>
              <p>O JurisApoio nasceu para garantir que nenhuma mulher vítima de violência fique sem acesso a orientação jurídica qualificada, independentemente de sua condição financeira.</p>
              <Link className="btn btn-primary" to="/orientacao">Conhecer meus direitos</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="footer-logo-icon"><i className="fas fa-balance-scale"></i></div>
                <span className="footer-logo-text">JurisApoio</span>
              </div>
              <p>Plataforma de apoio jurídico gratuito para vítimas de violência contra a mulher. Confidencial, seguro e acessível.</p>
              <div className="footer-socials">
                <div className="social-btn"><i className="fab fa-instagram"></i></div>
                <div className="social-btn"><i className="fab fa-facebook"></i></div>
                <div className="social-btn"><i className="fab fa-whatsapp"></i></div>
              </div>
            </div>
            <div className="footer-col">
              <h4>Plataforma</h4>
              <Link to="/">Início</Link>
              <Link to="/orientacao">Orientação Jurídica</Link>
              <Link to="/dashboard">Minha Área</Link>
            </div>
            <div className="footer-col">
              <h4>Institucional</h4>
              <Link to="/sobre">Sobre o projeto</Link>
              <a href="#">Política de privacidade</a>
              <a href="#">Termos de uso</a>
            </div>
            <div className="footer-col">
              <h4>Emergência</h4>
              <a href="tel:180">📞 180 — Central da Mulher</a>
              <a href="tel:190">📞 190 — Polícia</a>
              <a href="tel:192">📞 192 — SAMU</a>
              <a href="tel:100">📞 Disque 100 — Direitos Humanos</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 JurisApoio · Trabalho Acadêmico · Todos os dados são fictícios</p>
            <p style={{ opacity: 0.4 }}>Desenvolvido com 💜 para combater a violência contra a mulher</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
