export function Sobre() {
  return (
    <div className="page active" id="page-sobre">
      <div className="about-hero">
        <h1>Sobre o JurisApoio</h1>
        <p>Uma plataforma nascida do compromisso com a justiça social, a dignidade das mulheres e o poder transformador do Direito.</p>
      </div>

      <section>
        <div className="section-inner">
          <div className="section-tag">Nossa missão</div>
          <h2 className="section-title">Por que o JurisApoio existe</h2>
          <p style={{ fontSize: "16px", color: "var(--mid)", maxWidth: "680px", marginBottom: "40px", lineHeight: "1.75" }}>
            No Brasil, mais de 11 milhões de mulheres já sofreram violência doméstica grave — e a maioria não tem acesso a orientação jurídica qualificada. O JurisApoio surgiu para mudar essa realidade, conectando vítimas com profissionais do Direito de forma gratuita, segura e acessível.
          </p>
          <div className="mission-grid">
            <div className="mission-card">
              <i className="fas fa-heart" style={{ color: "var(--wine)" }}></i>
              <h3>Nossa Missão</h3>
              <p>Democratizar o acesso à justiça para mulheres vítimas de violência, garantindo orientação jurídica qualificada, gratuita e humanizada, independentemente de localização ou condição financeira.</p>
            </div>
            <div className="mission-card">
              <i className="fas fa-eye" style={{ color: "var(--blue)" }}></i>
              <h3>Nossa Visão</h3>
              <p>Ser a maior rede de apoio jurídico gratuito para mulheres no Brasil, presente em todos os estados, com impacto direto na redução da violência de gênero e no fortalecimento do sistema de proteção.</p>
            </div>
            <div className="mission-card">
              <i className="fas fa-hand-holding-heart" style={{ color: "var(--green)" }}></i>
              <h3>Nossos Valores</h3>
              <p>Empatia, confidencialidade, acessibilidade, rigor jurídico e compromisso com os direitos humanos. Toda decisão da plataforma parte das necessidades reais das mulheres atendidas.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
