export function Seguranca() {
  return (
    <div className="page active" id="page-seguranca">
      <div className="about-hero" style={{ background: "linear-gradient(135deg, #0d1a2e, #1e3a5f)" }}>
        <h1>Segurança & Privacidade</h1>
        <p>Sua proteção de dados é tão importante quanto sua proteção física. Saiba como mantemos suas informações seguras.</p>
      </div>

      <section>
        <div className="section-inner">
          <div className="sec-grid">
            <div className="sec-card">
              <div className="sec-card-icon" style={{ background: "#e8eef8", color: "var(--blue)" }}>
                <i className="fas fa-lock"></i>
              </div>
              <h3>Criptografia TLS 1.3</h3>
              <p>Toda comunicação entre o seu dispositivo e nossos servidores é protegida pelo protocolo TLS 1.3, o padrão mais avançado de segurança em trânsito disponível atualmente.</p>
            </div>
            <div className="sec-card">
              <div className="sec-card-icon" style={{ background: "var(--blush)", color: "var(--wine)" }}>
                <i className="fas fa-user-secret"></i>
              </div>
              <h3>Anonimato garantido</h3>
              <p>Não exigimos CPF nem nome completo no cadastro inicial. Você pode usar a plataforma com um apelido. Suas informações são pseudonimizadas internamente.</p>
            </div>
            <div className="sec-card">
              <div className="sec-card-icon" style={{ background: "#e6f5ef", color: "var(--green)" }}>
                <i className="fas fa-database"></i>
              </div>
              <h3>AES-256 em repouso</h3>
              <p>Todos os documentos e mensagens armazenados são criptografados com AES-256-GCM. Apenas você e seu advogado têm acesso ao conteúdo.</p>
            </div>
            <div className="sec-card">
              <div className="sec-card-icon" style={{ background: "#fef3e2", color: "var(--amber)" }}>
                <i className="fas fa-shield-virus"></i>
              </div>
              <h3>OWASP Top 10</h3>
              <p>Nossa plataforma é desenvolvida seguindo as melhores práticas de segurança da OWASP, protegendo contra as 10 vulnerabilidades mais críticas da web.</p>
            </div>
            <div className="sec-card">
              <div className="sec-card-icon" style={{ background: "#e8eef8", color: "var(--blue)" }}>
                <i className="fas fa-trash-alt"></i>
              </div>
              <h3>Direito ao esquecimento</h3>
              <p>Você pode solicitar a exclusão completa da sua conta e de todos os dados associados a qualquer momento, conforme garantido pelo Art. 18 da LGPD.</p>
            </div>
            <div className="sec-card">
              <div className="sec-card-icon" style={{ background: "var(--blush)", color: "var(--wine)" }}>
                <i className="fas fa-history"></i>
              </div>
              <h3>Logs com retenção limitada</h3>
              <p>Logs de acesso são mantidos por no máximo 6 meses e nunca contêm o conteúdo das mensagens, apenas metadados técnicos necessários à segurança.</p>
            </div>
          </div>

          <div className="lgpd-block">
            <h3><i className="fas fa-gavel" style={{ marginRight: "10px" }}></i> Conformidade com a LGPD</h3>
            <p>O JurisApoio está em conformidade plena com a Lei Geral de Proteção de Dados (Lei 13.709/2018). Implementamos todos os princípios estabelecidos pela legislação: finalidade, necessidade, transparência, segurança e não discriminação.</p>
            <div className="lgpd-items">
              <div className="lgpd-item"><i className="fas fa-check-circle"></i> Consentimento explícito registrado</div>
              <div className="lgpd-item"><i className="fas fa-check-circle"></i> Portabilidade de dados</div>
              <div className="lgpd-item"><i className="fas fa-check-circle"></i> Direito ao esquecimento</div>
              <div className="lgpd-item"><i className="fas fa-check-circle"></i> Minimização de dados</div>
              <div className="lgpd-item"><i className="fas fa-check-circle"></i> Encarregado (DPO) designado</div>
              <div className="lgpd-item"><i className="fas fa-check-circle"></i> Relatório de impacto (RIPD)</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
