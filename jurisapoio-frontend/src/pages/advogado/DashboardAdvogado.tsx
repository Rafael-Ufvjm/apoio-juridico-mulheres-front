import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { advogadoService } from "../../services/advogadoService";
import { casoService } from "../../services/casoService";
import type { Disponibilidade } from "../../types/api.types";

interface Case {
  id: string;
  victimName: string;
  age: string;
  city: string;
  urgency: "Alta" | "Moderada";
  violenceTypes: string[];
  date: string;
  status: "Pendente" | "Em Atendimento";
}

const mapViolenceType = (type: string) => {
  switch (type) {
    case "FISICA": return "Violência Física";
    case "PSICOLOGICA": return "Violência Psicológica";
    case "SEXUAL": return "Violência Sexual";
    case "PATRIMONIAL": return "Violência Patrimonial";
    case "MORAL": return "Violência Moral";
    default: return type;
  }
};

export function DashboardAdvogado() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"pending" | "my_cases">("pending");
  const [lawyerName, setLawyerName] = useState("Carregando...");
  const [lawyerOab, setLawyerOab] = useState("");
  const [lawyerUf, setLawyerUf] = useState("");
  const [lawyerId, setLawyerId] = useState("");
  const [availability, setAvailability] = useState<Disponibilidade>("ONLINE");
  
  // States for pending cases and lawyer cases
  const [pendingCases, setPendingCases] = useState<Case[]>([]);
  const [myCases, setMyCases] = useState<Case[]>([]);

  useEffect(() => {
    // Read current simulation state
    const triage = localStorage.getItem("triage_completed") === "true";
    const urgency = (localStorage.getItem("triage_urgency") as "Alta" | "Moderada") || "Moderada";
    const accepted = localStorage.getItem("chat_accepted") === "true";

    async function loadLawyerData() {
      try {
        const res = await advogadoService.obterPerfil();
        setLawyerName(res.data.nome);
        setLawyerId(res.data.id);
        setAvailability(res.data.disponibilidade);
        if (res.data.numeroOAB) {
          const parts = res.data.numeroOAB.split("/");
          setLawyerOab(parts[0]);
          setLawyerUf(parts[1] || "SP");
        }

        // Fetch lawyer cases
        const casesRes = await advogadoService.listarCasos();
        const activeCasesFormatted = casesRes.data
          .filter((c: any) => c.status === "EM_ATENDIMENTO")
          .map((c: any) => ({
            id: c.id,
            victimName: c.vitima ? c.vitima.nomeAnonimo : "Vítima Anônima",
            age: "Idade não informada",
            city: c.vitima && c.vitima.estadoResidencia ? `Localidade - ${c.vitima.estadoResidencia}` : "Não Informado",
            urgency: (c.tipoViolencia === "FISICA" || c.tipoViolencia === "SEXUAL" ? "Alta" : "Moderada") as "Alta" | "Moderada",
            violenceTypes: [mapViolenceType(c.tipoViolencia)],
            date: c.timestampAbertura ? new Date(c.timestampAbertura).toLocaleDateString("pt-BR") : "Hoje",
            status: "Em Atendimento" as const
          }));
        setMyCases(activeCasesFormatted);

        const active = casesRes.data.find(c => c.status === "EM_ATENDIMENTO");
        if (active) {
          localStorage.setItem("chat_accepted", "true");
          localStorage.setItem("chat_carlamendes", "true");
          localStorage.setItem("active_case_id", active.id);
        }

        // Fetch pending cases
        const pendingRes = await casoService.listarCasosPendentes();
        const pendingCasesFormatted = pendingRes.data.map((c: any) => ({
          id: c.id,
          victimName: c.vitima ? c.vitima.nomeAnonimo : "Vítima Anônima",
          age: "Idade não informada",
          city: c.vitima && c.vitima.estadoResidencia ? `Localidade - ${c.vitima.estadoResidencia}` : "Não Informado",
          urgency: c.tipoViolencia === "FISICA" || c.tipoViolencia === "SEXUAL" ? "Alta" : "Moderada",
          violenceTypes: [mapViolenceType(c.tipoViolencia)],
          date: c.timestampAbertura ? new Date(c.timestampAbertura).toLocaleDateString("pt-BR") : "Hoje",
          status: "Pendente" as const
        }));

        setPendingCases(pendingCasesFormatted);

      } catch (error) {
        console.warn("Backend offline ou sem sessão ativa. Carregando simulação local...", error);
        
        // Fallback simulation
        const email = localStorage.getItem("logged_lawyer_email");
        const lawyersData = localStorage.getItem("juris_lawyers");
        if (email && lawyersData) {
          const list = JSON.parse(lawyersData);
          const found = list.find((l: any) => l.email === email);
          if (found) {
            setLawyerName(found.name);
            setLawyerOab(found.oab);
            setLawyerUf(found.uf);
          }
        }

        const simulatedPending: Case[] = [];
        const simulatedMyCases: Case[] = [];

        if (triage) {
          const triageCase: Case = {
            id: "maria-oliveira",
            victimName: "Maria Oliveira",
            age: "34 anos",
            city: "São Paulo - SP",
            urgency: urgency,
            violenceTypes: ["Violência Psicológica", "Ameaças e Perseguição"],
            date: "Hoje",
            status: accepted ? "Em Atendimento" : "Pendente"
          };
          if (accepted) {
            simulatedMyCases.push(triageCase);
          } else {
            simulatedPending.push(triageCase);
          }
        }

        setPendingCases(simulatedPending);
        setMyCases(simulatedMyCases);
      }
    }

    loadLawyerData();
  }, []);

  const handleAvailabilityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as Disponibilidade;
    setAvailability(value);
    try {
      await advogadoService.atualizarDisponibilidade(value);
      alert(`Disponibilidade atualizada para ${value}!`);
    } catch (err) {
      console.warn("Erro ao atualizar disponibilidade no backend:", err);
    }
  };

  const handleAcceptCase = async (caseId: string) => {
    // Check if the advocate already has 5 active cases (limite de 5 casos)
    if (myCases.length >= 5) {
      alert("Você atingiu o limite máximo de 5 casos ativos simultâneos.");
      return;
    }

    if (caseId && lawyerId && caseId !== "maria-oliveira") {
      try {
        await casoService.aceitarCaso(caseId);
        
        // Remove from pending cases and sync list
        setPendingCases(prev => prev.filter(c => c.id !== caseId));
        
        const casesRes = await advogadoService.listarCasos();
        const activeCasesFormatted = casesRes.data
          .filter((c: any) => c.status === "EM_ATENDIMENTO")
          .map((c: any) => ({
            id: c.id,
            victimName: c.vitima ? c.vitima.nomeAnonimo : "Vítima Anônima",
            age: "Idade não informada",
            city: c.vitima && c.vitima.estadoResidencia ? `Localidade - ${c.vitima.estadoResidencia}` : "Não Informado",
            urgency: (c.tipoViolencia === "FISICA" || c.tipoViolencia === "SEXUAL" ? "Alta" : "Moderada") as "Alta" | "Moderada",
            violenceTypes: [mapViolenceType(c.tipoViolencia)],
            date: c.timestampAbertura ? new Date(c.timestampAbertura).toLocaleDateString("pt-BR") : "Hoje",
            status: "Em Atendimento" as const
          }));
        setMyCases(activeCasesFormatted);

        localStorage.setItem("chat_accepted", "true");
        localStorage.setItem("chat_carlamendes", "true");
        localStorage.setItem("active_case_id", caseId);
        alert("Você aceitou o caso com sucesso! Um canal de comunicação seguro foi aberto.");
        setActiveTab("my_cases");
        return;
      } catch (err: any) {
        console.error("Erro ao aceitar o caso via API:", err);
        const errMsg = err.response?.data?.mensagem || "Erro ao aceitar o caso.";
        alert(errMsg);
        return;
      }
    }

    if (caseId === "maria-oliveira") {
      localStorage.setItem("chat_accepted", "true");
      localStorage.setItem("chat_carlamendes", "true"); // Connects chat on victim side
      
      const foundCase = pendingCases.find(c => c.id === caseId);
      if (foundCase) {
        const updatedCase = { ...foundCase, status: "Em Atendimento" as const };
        setPendingCases(prev => prev.filter(c => c.id !== caseId));
        setMyCases(prev => [...prev, updatedCase]);
      }
      alert("Você aceitou o caso simulado com sucesso! Um canal de comunicação seguro foi aberto.");
      setActiveTab("my_cases");
    } else {
      alert("Este caso simulado já foi aceito por outro advogado voluntário.");
    }
  };

  const handleCloseCase = async (caseId: string) => {
    if (!confirm("Deseja realmente encerrar este caso permanentemente? Esta ação arquivará o atendimento e removerá o histórico de mensagens por segurança.")) {
      return;
    }

    const result = prompt("Por favor, informe a justificativa ou resultado do encerramento (obrigatório):", "Orientação concluída");
    if (result === null) return;
    const trimmedResult = result.trim();
    if (!trimmedResult) {
      alert("O resultado do encerramento é obrigatório!");
      return;
    }

    if (caseId === "maria-oliveira") {
      setMyCases(prev => prev.filter(c => c.id !== caseId));
      localStorage.removeItem("chat_accepted");
      localStorage.removeItem("chat_carlamendes");
      localStorage.removeItem("active_case_id");
      localStorage.removeItem("triage_completed");
      alert("Caso simulado encerrado com sucesso.");
      return;
    }

    try {
      await casoService.encerrarCaso(caseId, { resultado: trimmedResult });
      
      setMyCases(prev => prev.filter(c => c.id !== caseId));
      
      const activeId = localStorage.getItem("active_case_id");
      if (activeId === caseId) {
        localStorage.removeItem("chat_accepted");
        localStorage.removeItem("chat_carlamendes");
        localStorage.removeItem("active_case_id");
      }

      alert("Caso encerrado com sucesso. O histórico de mensagens foi apagado.");
    } catch (err: any) {
      console.error("Erro ao encerrar caso:", err);
      alert(err.response?.data?.mensagem || "Erro ao encerrar o caso.");
    }
  };


  const handleResetSimulation = () => {
    if (confirm("Deseja resetar toda a simulação para os valores padrões?")) {
      localStorage.removeItem("triage_completed");
      localStorage.removeItem("triage_urgency");
      localStorage.removeItem("chat_accepted");
      localStorage.removeItem("chat_carlamendes");
      localStorage.removeItem("active_case_id");
      alert("Simulação resetada!");
      window.location.reload();
    }
  };

  const displayedPending = pendingCases;

  return (
    <div className="page active" id="page-dashboard-advogado" style={{ paddingTop: "64px", minHeight: "100vh" }}>
      <div className="dashboard">
        {/* Sidebar */}
        <div className="dash-sidebar" style={{ backgroundColor: "var(--wine3)" }}>
          <div className="dash-user">
            <div className="dash-user-avatar" style={{ background: "var(--blue)" }}>
              {lawyerName.split(" ").filter((w: string) => {
                const lower = w.toLowerCase().replace(/[^a-z]/g, "");
                return lower !== "dr" && lower !== "dra" && lower !== "dr(a)";
              }).map((w: string) => w[0]).join("").substring(0, 2).toUpperCase() || "ADV"}
            </div>
            <div className="dash-user-info">
              <strong>{lawyerName}</strong>
              <span style={{ fontSize: "11px", opacity: 0.8 }}>OAB/{lawyerUf} {lawyerOab} · Voluntária</span>
            </div>
          </div>
          
          <div className="dash-menu">
            <button
              onClick={() => setActiveTab("pending")}
              className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition"
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
                marginBottom: "4px"
              }}
            >
              <i className="fas fa-list-ul w-5 text-center"></i> Casos Pendentes na Rede
              {displayedPending.length > 0 && (
                <span className="unread" style={{ marginLeft: "auto", background: "var(--rose)" }}>
                  {displayedPending.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("my_cases")}
              className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition"
              style={{
                background: activeTab === "my_cases" ? "rgba(255,255,255,0.12)" : "transparent",
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
                marginBottom: "4px"
              }}
            >
              <i className="fas fa-folder-open w-5 text-center"></i> Meus Atendimentos
              {myCases.length > 0 && (
                <span className="unread" style={{ marginLeft: "auto", background: "var(--green)" }}>
                  {myCases.length}
                </span>
              )}
            </button>

            <div style={{ marginTop: "40px", borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: "20px" }}>
              <button
                onClick={handleResetSimulation}
                className="btn btn-ghost"
                style={{
                  width: "100%",
                  color: "#fff",
                  borderColor: "rgba(255,255,255,0.3)",
                  fontSize: "12px",
                  padding: "8px"
                }}
              >
                <i className="fas fa-undo"></i> Resetar Simulação
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="dash-content">
          <div className="dash-header">
            <div>
              <span className="badge badge-blue" style={{ marginBottom: "6px" }}>Painel de Advocacia Pro Bono</span>
              <h2>Olá, {lawyerName} 👋</h2>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "6px", padding: "6px 12px", fontSize: "13px" }}>
                Status CNA: <strong style={{ color: "var(--green)" }}>✓ Regularizado</strong>
              </div>
              <select
                value={availability}
                onChange={handleAvailabilityChange}
                style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "6px", padding: "6px 12px", fontSize: "13px", cursor: "pointer", outline: "none", fontFamily: "inherit" }}
              >
                <option value="ONLINE">🟢 Online</option>
                <option value="OFFLINE">⚫ Offline</option>
                <option value="OCUPADO">🔴 Ocupado</option>
              </select>
            </div>
          </div>

          {/* Key Stats Cards */}
          <div className="dash-cards">
            <div className="dash-card">
              <div className="dash-card-icon" style={{ background: "var(--blush)", color: "var(--wine)" }}>
                <i className="fas fa-clock"></i>
              </div>
              <span>Casos Pendentes</span>
              <strong>{displayedPending.length} casos</strong>
              <small>Disponíveis para acolhimento</small>
            </div>
            <div className="dash-card">
              <div className="dash-card-icon" style={{ background: "#e6f5ef", color: "var(--green)" }}>
                <i className="fas fa-hands-helping"></i>
              </div>
              <span>Meus Casos Ativos</span>
              <strong>{myCases.length} atendimentos</strong>
              <small>Em orientação jurídica</small>
            </div>
            <div className="dash-card">
              <div className="dash-card-icon" style={{ background: "#e8eef8", color: "var(--blue)" }}>
                <i className="fas fa-award"></i>
              </div>
              <span>Selo Pro Bono</span>
              <strong>Doadora Bronze</strong>
              <small>Mais de 15h registradas</small>
            </div>
          </div>

          {/* Tab: Pending Cases */}
          {activeTab === "pending" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "18px", color: "var(--wine)", fontFamily: "Playfair Display, serif" }}>Fila de Atendimento e Triagem</h3>
                <span style={{ fontSize: "13px", color: "var(--mid)" }}>A triagem ajuda a priorizar casos urgentes</span>
              </div>

              {displayedPending.length === 0 ? (
                <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "var(--r2)", padding: "48px 24px", textAlign: "center", boxShadow: "var(--shadow)" }}>
                  <i className="fas fa-check-circle" style={{ fontSize: "48px", color: "var(--green)", marginBottom: "16px" }}></i>
                  <h4>Fila limpa no momento!</h4>
                  <p style={{ color: "var(--mid)", fontSize: "14px", maxWidth: "400px", margin: "8px auto 0" }}>
                    Não há casos na fila precisando de atendimento no momento. Obrigado pelo seu apoio!
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {displayedPending.map(c => (
                    <div key={c.id} style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "var(--r2)", padding: "20px", boxShadow: "var(--shadow)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
                        <div>
                          <h4 style={{ fontSize: "16px", color: "var(--wine)", marginBottom: "4px" }}>
                            {c.victimName} ({c.age})
                          </h4>
                          <span style={{ fontSize: "12.5px", color: "var(--mid)" }}>
                            <i className="fas fa-map-marker-alt"></i> {c.city} · Entrada: {c.date}
                          </span>
                        </div>
                        <span className={`badge ${c.urgency === "Alta" ? "badge-wine" : "badge-green"}`}>
                          Risco: {c.urgency === "Alta" ? "Alto" : "Moderado"}
                        </span>
                      </div>

                      <div style={{ marginBottom: "16px" }}>
                        <strong style={{ display: "block", fontSize: "13px", color: "var(--slate)", marginBottom: "6px" }}>Violências relatadas na triagem:</strong>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          {c.violenceTypes.map(v => (
                            <span key={v} className="tag tag-wine" style={{ fontSize: "11px", padding: "4px 10px" }}>{v}</span>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--border)", paddingTop: "14px" }}>
                        <button
                          onClick={() => handleAcceptCase(c.id)}
                          className="btn btn-wine"
                          style={{ fontSize: "13.5px", padding: "8px 18px" }}
                        >
                          <i className="fas fa-check"></i> Aceitar e Orientar Caso
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: My Cases */}
          {activeTab === "my_cases" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "18px", color: "var(--wine)", fontFamily: "Playfair Display, serif" }}>Seus Casos em Atendimento</h3>
                <span style={{ fontSize: "13px", color: "var(--mid)" }}>Canal direto e seguro via chat</span>
              </div>

              {myCases.length === 0 ? (
                <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "var(--r2)", padding: "48px 24px", textAlign: "center", boxShadow: "var(--shadow)" }}>
                  <i className="fas fa-folder" style={{ fontSize: "48px", color: "var(--soft)", marginBottom: "16px" }}></i>
                  <h4>Nenhum caso sob sua responsabilidade</h4>
                  <p style={{ color: "var(--mid)", fontSize: "14px", maxWidth: "400px", margin: "8px auto 16px" }}>
                    Você ainda não acolheu nenhum caso na fila. Vá para a aba "Casos Pendentes na Rede" para aceitar um caso.
                  </p>
                  <button onClick={() => setActiveTab("pending")} className="btn btn-wine">
                    Visualizar Casos Pendentes
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {myCases.map(c => (
                    <div key={c.id} style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "var(--r2)", padding: "20px", boxShadow: "var(--shadow)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
                        <div>
                          <h4 style={{ fontSize: "16px", color: "var(--wine)", marginBottom: "4px" }}>
                            {c.victimName} ({c.age})
                          </h4>
                          <span style={{ fontSize: "12.5px", color: "var(--mid)" }}>
                            <i className="fas fa-map-marker-alt"></i> {c.city} · Protocolo #JA-2025-4821
                          </span>
                        </div>
                        <span className="badge badge-green" style={{ background: "#e6f5ef", color: "var(--green)" }}>
                          Em Orientação Ativa
                        </span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid var(--border)", paddingTop: "14px" }}>
                        <button
                          onClick={() => handleCloseCase(c.id)}
                          className="btn btn-ghost"
                          style={{ fontSize: "13.5px", padding: "8px 18px", color: "var(--wine)", borderColor: "var(--wine)" }}
                        >
                          <i className="fas fa-gavel"></i> Encerrar Caso
                        </button>
                        <button
                          onClick={() => {
                            localStorage.setItem("chat_carlamendes", "true"); // Ensures chat is enabled
                            localStorage.setItem("active_case_id", c.id); // Save backend case ID for lawyer too!
                            navigate("/chat");
                          }}
                          className="btn btn-wine"
                          style={{ fontSize: "13.5px", padding: "8px 18px" }}
                        >
                          <i className="fas fa-comments"></i> Abrir Chat Seguro
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
