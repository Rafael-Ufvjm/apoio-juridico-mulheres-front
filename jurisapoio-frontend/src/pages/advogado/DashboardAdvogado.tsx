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

export function DashboardAdvogado() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"pending" | "my_cases">("pending");
  const [lawyerName, setLawyerName] = useState("Dra. Carla Mendes");
  const [lawyerOab, setLawyerOab] = useState("187.432");
  const [lawyerUf, setLawyerUf] = useState("SP");
  const [lawyerId, setLawyerId] = useState("");
  const [availability, setAvailability] = useState<Disponibilidade>("ONLINE");
  
  // Real-time states reading from localStorage to sync with the victim simulation
  const [hasTriageCompleted, setHasTriageCompleted] = useState(false);
  const [triageUrgency, setTriageUrgency] = useState<"Alta" | "Moderada">("Moderada");
  const [isChatAccepted, setIsChatAccepted] = useState(false);

  // Backend case state
  const [backendCase, setBackendCase] = useState<any>(null);

  useEffect(() => {
    // Read current simulation state
    const triage = localStorage.getItem("triage_completed") === "true";
    const urgency = (localStorage.getItem("triage_urgency") as "Alta" | "Moderada") || "Moderada";
    const accepted = localStorage.getItem("chat_accepted") === "true";

    setHasTriageCompleted(triage);
    setTriageUrgency(urgency);
    setIsChatAccepted(accepted);

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
        const active = casesRes.data.find(c => c.status === "EM_ATENDIMENTO");
        if (active) {
          setIsChatAccepted(true);
          localStorage.setItem("chat_accepted", "true");
          localStorage.setItem("chat_carlamendes", "true");
          localStorage.setItem("active_case_id", active.id);
        }
      } catch (error) {
        console.warn("Backend offline ou sem sessão ativa. Carregando simulação local...", error);
        
        // Load active lawyer session details from localStorage fallback
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
      }
    }

    loadLawyerData();

    // Load active case details from backend if present
    const activeCaseId = localStorage.getItem("active_case_id");
    if (activeCaseId) {
      casoService.buscarPorId(activeCaseId)
        .then(res => {
          setBackendCase(res.data);
        })
        .catch(err => {
          console.warn("Não foi possível buscar os detalhes do caso no backend:", err);
        });
    }
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
    if (caseId && lawyerId && caseId !== "maria-oliveira") {
      try {
        await casoService.atribuirAdvogado(caseId, lawyerId);
        localStorage.setItem("chat_accepted", "true");
        localStorage.setItem("chat_carlamendes", "true");
        localStorage.setItem("active_case_id", caseId);
        setIsChatAccepted(true);
        alert("Você aceitou o caso com sucesso! Um canal de comunicação seguro foi aberto.");
        setActiveTab("my_cases");
        return;
      } catch (err) {
        console.warn("Erro ao aceitar o caso via API. Usando fallback simulado...", err);
      }
    }

    if (caseId === "maria-oliveira" || caseId === localStorage.getItem("active_case_id")) {
      localStorage.setItem("chat_accepted", "true");
      localStorage.setItem("chat_carlamendes", "true"); // Connects chat on victim side
      setIsChatAccepted(true);
      alert("Você aceitou o caso de Maria Oliveira com sucesso! Um canal de comunicação seguro foi aberto.");
      setActiveTab("my_cases");
    } else {
      alert("Este caso simulado já foi aceito por outro advogado voluntário.");
    }
  };

  const handleResetSimulation = () => {
    if (confirm("Deseja resetar toda a simulação para os valores padrões?")) {
      localStorage.removeItem("triage_completed");
      localStorage.removeItem("triage_urgency");
      localStorage.removeItem("chat_accepted");
      localStorage.removeItem("chat_carlamendes");
      localStorage.removeItem("active_case_id");
      setHasTriageCompleted(false);
      setIsChatAccepted(false);
      alert("Simulação resetada!");
      window.location.reload();
    }
  };

  // Mock pending cases in the system
  const pendingCases: Case[] = [];
  
  if (backendCase) {
    const isAssignedToMe = backendCase.advogado && backendCase.advogado.id === lawyerId;
    const isAwaiting = backendCase.status === "AGUARDANDO";

    if (isAwaiting || isAssignedToMe) {
      pendingCases.push({
        id: backendCase.id,
        victimName: backendCase.vitima ? backendCase.vitima.nomeAnonimo : "Vítima Anônima",
        age: "34 anos",
        city: (backendCase.vitima && backendCase.vitima.estadoResidencia) 
          ? `Localidade - ${backendCase.vitima.estadoResidencia}` 
          : "São Paulo - SP",
        urgency: backendCase.tipoViolencia === "FISICA" || backendCase.tipoViolencia === "SEXUAL" ? "Alta" : "Moderada",
        violenceTypes: [backendCase.tipoViolencia],
        date: "Hoje",
        status: isAssignedToMe ? "Em Atendimento" : "Pendente"
      });
    }
  }

  // If the victim did the triage locally (offline fallback)
  if (hasTriageCompleted && !pendingCases.some(c => c.id === "maria-oliveira" || c.id === localStorage.getItem("active_case_id"))) {
    pendingCases.push({
      id: "maria-oliveira",
      victimName: "Maria Oliveira",
      age: "34 anos",
      city: "São Paulo - SP",
      urgency: triageUrgency,
      violenceTypes: ["Violência Psicológica", "Ameaças e Perseguição"],
      date: "Hoje",
      status: isChatAccepted ? "Em Atendimento" : "Pendente"
    });
  }

  // Add a few more mock cases to populate the dashboard
  pendingCases.push(
    {
      id: "case-2",
      victimName: "Patricia S.",
      age: "28 anos",
      city: "Belo Horizonte - MG",
      urgency: "Alta",
      violenceTypes: ["Violência Física", "Violência Psicológica"],
      date: "Ontem",
      status: "Pendente"
    },
    {
      id: "case-3",
      victimName: "Ana Clara M.",
      age: "41 anos",
      city: "Rio de Janeiro - RJ",
      urgency: "Moderada",
      violenceTypes: ["Violência Patrimonial", "Violência Psicológica"],
      date: "14/06/2026",
      status: "Pendente"
    }
  );

  const displayedPending = pendingCases.filter(c => c.status === "Pendente");
  const myCases = pendingCases.filter(c => c.status === "Em Atendimento" || (c.id === "maria-oliveira" && isChatAccepted));

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
