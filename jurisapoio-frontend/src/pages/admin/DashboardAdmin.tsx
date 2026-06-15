import { useState, useEffect } from "react";

interface Lawyer {
  id: number;
  name: string;
  email: string;
  oab: string;
  uf: string;
  specialties: string[];
  seal: string;
  experience: string;
  cases: string;
  rating: string;
  availability: string;
  color: string;
  gradient: string;
  status: "approved" | "pending" | "rejected";
}

export function DashboardAdmin() {
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Load lawyers from localStorage
  const loadLawyers = () => {
    const data = localStorage.getItem("juris_lawyers");
    if (data) {
      setLawyers(JSON.parse(data));
    }
  };

  useEffect(() => {
    loadLawyers();
  }, []);

  // Show a status alert message that auto-dismisses
  const triggerMessage = (text: string, type: "success" | "error" | "info") => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage(null);
    }, 4000);
  };

  // Action: Change status of a lawyer
  const handleUpdateStatus = (id: number, newStatus: "approved" | "pending" | "rejected") => {
    const updated = lawyers.map((lawyer) => {
      if (lawyer.id === id) {
        let seal = lawyer.seal;
        if (newStatus === "approved") {
          seal = "Advogada Voluntária Verificada";
        } else if (newStatus === "rejected") {
          seal = "Acesso Negado / Suspenso";
        } else {
          seal = "Aguardando Verificação";
        }
        return { ...lawyer, status: newStatus, seal };
      }
      return lawyer;
    });

    localStorage.setItem("juris_lawyers", JSON.stringify(updated));
    setLawyers(updated);

    const lawyerName = lawyers.find((l) => l.id === id)?.name || "Advogado(a)";
    if (newStatus === "approved") {
      triggerMessage(`Acesso concedido com sucesso para ${lawyerName}!`, "success");
    } else if (newStatus === "rejected") {
      triggerMessage(`Acesso de ${lawyerName} foi revogado ou recusado.`, "error");
    } else {
      triggerMessage(`Cadastro de ${lawyerName} movido para a fila de análise.`, "info");
    }
  };

  // Reset simulation database to initial state
  const handleResetDatabase = () => {
    if (window.confirm("Deseja resetar a base de advogados para os valores iniciais?")) {
      localStorage.removeItem("juris_lawyers");
      // Force reload or reinitialize
      const data = localStorage.getItem("juris_lawyers");
      if (!data) {
        window.location.reload();
      }
    }
  };

  // Filter lists
  const pendingLawyers = lawyers.filter((l) => l.status === "pending");
  const approvedLawyers = lawyers.filter((l) => l.status === "approved");
  const rejectedLawyers = lawyers.filter((l) => l.status === "rejected");

  return (
    <div className="page active" id="page-dashboard-admin" style={{ paddingTop: "64px", minHeight: "100vh" }}>
      <div className="dashboard">
        {/* Sidebar */}
        <div className="dash-sidebar" style={{ backgroundColor: "var(--wine3)" }}>
          <div className="dash-user">
            <div className="dash-user-avatar" style={{ background: "var(--wine)" }}>AD</div>
            <div className="dash-user-info">
              <strong>Administrador</strong>
              <span style={{ fontSize: "11px", opacity: 0.8 }}>Painel de Homologação</span>
            </div>
          </div>

          <div className="dash-menu">
            <button
              onClick={() => setActiveTab("pending")}
              style={{
                background: activeTab === "pending" ? "rgba(255,255,255,0.12)" : "transparent",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                font: "inherit",
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "4px",
                textAlign: "left"
              }}
            >
              <i className="fas fa-user-clock w-5 text-center"></i> Fila de Aprovação
              {pendingLawyers.length > 0 && (
                <span className="unread" style={{ marginLeft: "auto", background: "var(--rose)" }}>
                  {pendingLawyers.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("approved")}
              style={{
                background: activeTab === "approved" ? "rgba(255,255,255,0.12)" : "transparent",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                font: "inherit",
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "4px",
                textAlign: "left"
              }}
            >
              <i className="fas fa-user-check w-5 text-center"></i> Advogados Ativos
              {approvedLawyers.length > 0 && (
                <span className="unread" style={{ marginLeft: "auto", background: "var(--green)" }}>
                  {approvedLawyers.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("rejected")}
              style={{
                background: activeTab === "rejected" ? "rgba(255,255,255,0.12)" : "transparent",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                font: "inherit",
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "4px",
                textAlign: "left"
              }}
            >
              <i className="fas fa-user-slash w-5 text-center"></i> Bloqueados / Rejeitados
              {rejectedLawyers.length > 0 && (
                <span className="unread" style={{ marginLeft: "auto", background: "var(--slate)" }}>
                  {rejectedLawyers.length}
                </span>
              )}
            </button>

            <div style={{ marginTop: "40px", borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: "20px" }}>
              <button
                onClick={handleResetDatabase}
                className="btn btn-ghost"
                style={{
                  width: "100%",
                  color: "#fff",
                  borderColor: "rgba(255,255,255,0.3)",
                  fontSize: "12px",
                  padding: "8px",
                  cursor: "pointer"
                }}
              >
                <i className="fas fa-database"></i> Resetar Lista
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="dash-content">
          {message && (
            <div
              style={{
                background:
                  message.type === "success"
                    ? "#e6f5ef"
                    : message.type === "error"
                    ? "#fdf2f2"
                    : "#f4f6f9",
                color:
                  message.type === "success"
                    ? "var(--green)"
                    : message.type === "error"
                    ? "var(--wine)"
                    : "var(--slate)",
                border: `1px solid ${
                  message.type === "success"
                    ? "var(--green)"
                    : message.type === "error"
                    ? "var(--rose)"
                    : "var(--border)"
                }`,
                borderRadius: "var(--r1)",
                padding: "12px 16px",
                marginBottom: "20px",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <i
                className={`fas ${
                  message.type === "success"
                    ? "fa-check-circle"
                    : message.type === "error"
                    ? "fa-exclamation-circle"
                    : "fa-info-circle"
                }`}
              ></i>
              <span>{message.text}</span>
            </div>
          )}

          <div className="dash-header">
            <div>
              <span className="badge badge-wine" style={{ marginBottom: "6px" }}>Painel de Controle Administrativo</span>
              <h2>Gerenciamento de Acesso Jurídico ⚖️</h2>
            </div>
          </div>

          {/* Key Stats Cards */}
          <div className="dash-cards">
            <div className="dash-card">
              <div className="dash-card-icon" style={{ background: "var(--blush)", color: "var(--wine)" }}>
                <i className="fas fa-clock"></i>
              </div>
              <span>Aguardando Análise</span>
              <strong>{pendingLawyers.length} solicitações</strong>
              <small>Verificações pendentes</small>
            </div>
            <div className="dash-card">
              <div className="dash-card-icon" style={{ background: "#e6f5ef", color: "var(--green)" }}>
                <i className="fas fa-check-double"></i>
              </div>
              <span>Advogados Ativos</span>
              <strong>{approvedLawyers.length} homologados</strong>
              <small>Acesso liberado ao site</small>
            </div>
            <div className="dash-card">
              <div className="dash-card-icon" style={{ background: "#f1f3f5", color: "var(--slate)" }}>
                <i className="fas fa-ban"></i>
              </div>
              <span>Acesso Suspenso</span>
              <strong>{rejectedLawyers.length} negados</strong>
              <small>Cadastros recusados</small>
            </div>
          </div>

          {/* Section Heading */}
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "19px", color: "var(--wine)", fontFamily: "Playfair Display, serif", fontWeight: "bold" }}>
              {activeTab === "pending" && "Solicitações de Acesso Pendentes"}
              {activeTab === "approved" && "Profissionais com Acesso Autorizado"}
              {activeTab === "rejected" && "Registros Suspensos ou Recusados"}
            </h3>
            <p style={{ color: "var(--mid)", fontSize: "13.5px", marginTop: "4px" }}>
              {activeTab === "pending" && "Homologação de advogados voluntários. Verifique o CNA antes de liberar."}
              {activeTab === "approved" && "Advogados com credenciais ativas. Podem orientar vítimas no chat."}
              {activeTab === "rejected" && "Advogados com acesso revogado ou solicitações rejeitadas."}
            </p>
          </div>

          {/* Tab lists */}
          {activeTab === "pending" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {pendingLawyers.length === 0 ? (
                <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "var(--r2)", padding: "48px 24px", textAlign: "center", boxShadow: "var(--shadow)" }}>
                  <i className="fas fa-check-circle" style={{ fontSize: "48px", color: "var(--green)", marginBottom: "16px" }}></i>
                  <h4>Nenhuma solicitação pendente!</h4>
                  <p style={{ color: "var(--mid)", fontSize: "14px", maxWidth: "400px", margin: "8px auto 0" }}>
                    Todos os cadastros de advogados foram analisados e homologados.
                  </p>
                </div>
              ) : (
                pendingLawyers.map((lawyer) => (
                  <div key={lawyer.id} style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "var(--r2)", padding: "20px", boxShadow: "var(--shadow)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "14px" }}>
                      <div>
                        <h4 style={{ fontSize: "16.5px", color: "var(--wine)", marginBottom: "4px" }}>{lawyer.name}</h4>
                        <span style={{ fontSize: "13px", color: "var(--mid)" }}>
                          <i className="fas fa-envelope"></i> {lawyer.email} &nbsp;|&nbsp; <i className="fas fa-address-card"></i> OAB/{lawyer.uf} {lawyer.oab}
                        </span>
                      </div>
                      <span className="badge badge-blue" style={{ fontSize: "11px" }}>
                        Pendente
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", marginBottom: "16px", background: "var(--warm)", padding: "10px 14px", borderRadius: "6px" }}>
                      <div style={{ fontSize: "13px" }}>
                        <span style={{ color: "var(--mid)", display: "block" }}>Especialidades</span>
                        <strong>{lawyer.specialties.join(", ")}</strong>
                      </div>
                      <div style={{ fontSize: "13px" }}>
                        <span style={{ color: "var(--mid)", display: "block" }}>Experiência Relatada</span>
                        <strong>{lawyer.experience || "Não informado"}</strong>
                      </div>
                      <div style={{ fontSize: "13px" }}>
                        <span style={{ color: "var(--mid)", display: "block" }}>Validação CNA (Simulado)</span>
                        <strong style={{ color: "var(--green)" }}><i className="fas fa-check-circle"></i> OAB Regular &amp; Ativa</strong>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid var(--border)", paddingTop: "14px" }}>
                      <button
                        onClick={() => handleUpdateStatus(lawyer.id, "rejected")}
                        className="btn"
                        style={{ background: "#fff", border: "1px solid var(--rose)", color: "var(--wine)", fontSize: "13px", padding: "8px 16px", cursor: "pointer" }}
                      >
                        <i className="fas fa-times"></i> Recusar Acesso
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(lawyer.id, "approved")}
                        className="btn btn-wine"
                        style={{ fontSize: "13px", padding: "8px 20px", cursor: "pointer" }}
                      >
                        <i className="fas fa-user-plus"></i> Homologar &amp; Liberar Acesso
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "approved" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {approvedLawyers.length === 0 ? (
                <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "var(--r2)", padding: "48px 24px", textAlign: "center", boxShadow: "var(--shadow)" }}>
                  <i className="fas fa-user-slash" style={{ fontSize: "48px", color: "var(--soft)", marginBottom: "16px" }}></i>
                  <h4>Nenhum advogado homologado</h4>
                  <p style={{ color: "var(--mid)", fontSize: "14px", margin: "8px auto 0" }}>
                    Não há advogados com acesso ativo no momento.
                  </p>
                </div>
              ) : (
                approvedLawyers.map((lawyer) => (
                  <div key={lawyer.id} style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "var(--r2)", padding: "20px", boxShadow: "var(--shadow)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "10px" }}>
                      <div>
                        <h4 style={{ fontSize: "16.5px", color: "var(--wine)", marginBottom: "4px" }}>{lawyer.name}</h4>
                        <span style={{ fontSize: "13px", color: "var(--mid)" }}>
                          Email: {lawyer.email} | OAB/{lawyer.uf} {lawyer.oab}
                        </span>
                      </div>
                      <span className="badge badge-green" style={{ fontSize: "11px" }}>
                        Ativo
                      </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--border)", paddingTop: "12px", marginTop: "12px" }}>
                      <button
                        onClick={() => handleUpdateStatus(lawyer.id, "rejected")}
                        className="btn"
                        style={{ background: "#fdf2f2", border: "1px solid var(--rose)", color: "var(--wine)", fontSize: "12.5px", padding: "6px 14px", cursor: "pointer" }}
                      >
                        <i className="fas fa-ban"></i> Suspender Acesso
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "rejected" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {rejectedLawyers.length === 0 ? (
                <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "var(--r2)", padding: "48px 24px", textAlign: "center", boxShadow: "var(--shadow)" }}>
                  <i className="fas fa-check" style={{ fontSize: "48px", color: "var(--green)", marginBottom: "16px" }}></i>
                  <h4>Nenhum advogado bloqueado</h4>
                  <p style={{ color: "var(--mid)", fontSize: "14px", margin: "8px auto 0" }}>
                    Não há cadastros suspensos ou rejeitados na base.
                  </p>
                </div>
              ) : (
                rejectedLawyers.map((lawyer) => (
                  <div key={lawyer.id} style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "var(--r2)", padding: "20px", boxShadow: "var(--shadow)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "10px" }}>
                      <div>
                        <h4 style={{ fontSize: "16.5px", color: "var(--wine)", marginBottom: "4px" }}>{lawyer.name}</h4>
                        <span style={{ fontSize: "13px", color: "var(--mid)" }}>
                          Email: {lawyer.email} | OAB/{lawyer.uf} {lawyer.oab}
                        </span>
                      </div>
                      <span className="badge badge-wine" style={{ fontSize: "11px", background: "var(--blush)", color: "var(--wine)" }}>
                        Bloqueado
                      </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--border)", paddingTop: "12px", marginTop: "12px" }}>
                      <button
                        onClick={() => handleUpdateStatus(lawyer.id, "approved")}
                        className="btn btn-wine"
                        style={{ fontSize: "12.5px", padding: "6px 14px", cursor: "pointer" }}
                      >
                        <i className="fas fa-undo"></i> Reavaliar e Liberar Acesso
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
