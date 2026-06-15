import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { vitimaService } from "../../services/vitimaService";
import { casoService } from "../../services/casoService";
import type { TipoViolencia } from "../../types/api.types";

interface Message {
  id: number;
  sender: string;
  avatar: string;
  time: string;
  content: string;
  status: "Lida" | "Nova";
  color: string;
}

export function DashboardVitima() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "triagem" | "status" | "msgs">("overview");

  // Victim profile state
  const [victimName, setVictimName] = useState("Maria Oliveira");

  // Triage state
  const [triageStep, setTriageStep] = useState(1);
  const [triageCompleted, setTriageCompleted] = useState(false);
  
  // Triage form answers
  const [violenceTypes, setViolenceTypes] = useState<string[]>([]);
  const [hasWeapon, setHasWeapon] = useState<string>("");
  const [sharesHome, setSharesHome] = useState<string>("");
  const [recentAggression, setRecentAggression] = useState<string>("");
  const [needs, setNeeds] = useState<string[]>([]);
  
  // Severity assessment
  const [urgencyLevel, setUrgencyLevel] = useState<"Alta" | "Moderada">("Moderada");
  const [lawyerAccepted, setLawyerAccepted] = useState(false);

  // Load state from backend (or fallback to localStorage on mount)
  useEffect(() => {
    async function loadData() {
      try {
        const profileRes = await vitimaService.obterPerfil();
        if (profileRes.data && profileRes.data.nomeAnonimo) {
          setVictimName(profileRes.data.nomeAnonimo);
        }

        const casesRes = await casoService.listarCasosDaVitima();
        const activeCase = casesRes.data.find(
          c => c.status === "AGUARDANDO" || c.status === "EM_ATENDIMENTO"
        );

        if (activeCase) {
          setTriageCompleted(true);
          const isHigh = activeCase.tipoViolencia === "FISICA" || activeCase.tipoViolencia === "SEXUAL";
          const urgency = isHigh ? "Alta" : "Moderada";
          setUrgencyLevel(urgency);
          
          localStorage.setItem("active_case_id", activeCase.id);
          localStorage.setItem("triage_completed", "true");
          localStorage.setItem("triage_urgency", urgency);

          if (activeCase.advogado) {
            setLawyerAccepted(true);
            localStorage.setItem("chat_accepted", "true");
            localStorage.setItem("chat_carlamendes", "true");
          } else {
            setLawyerAccepted(false);
            localStorage.removeItem("chat_accepted");
            localStorage.removeItem("chat_carlamendes");
          }
        } else {
          // No active case on backend
          localStorage.removeItem("active_case_id");
          localStorage.removeItem("triage_completed");
          localStorage.removeItem("triage_urgency");
          localStorage.removeItem("chat_accepted");
          localStorage.removeItem("chat_carlamendes");
          setTriageCompleted(false);
          setLawyerAccepted(false);
        }
      } catch (error) {
        console.warn("Backend offline ou sem sessão ativa. Carregando simulação local...", error);
        
        // Fallback local mockup load
        const savedTriage = localStorage.getItem("triage_completed");
        if (savedTriage === "true") {
          setTriageCompleted(true);
          const savedUrgency = localStorage.getItem("triage_urgency");
          if (savedUrgency) setUrgencyLevel(savedUrgency as "Alta" | "Moderada");
          
          const savedAccepted = localStorage.getItem("chat_accepted");
          if (savedAccepted === "true") {
            setLawyerAccepted(true);
          }
        }
      }
    }
    loadData();
  }, []);

  const [messages] = useState<Message[]>([
    {
      id: 1,
      sender: "Sistema JurisApoio",
      avatar: "🔔",
      time: "Hoje, 10:23",
      content: "Bem-vinda à plataforma! Por favor, realize a sua Triagem para que possamos te conectar com um advogado voluntário.",
      status: "Nova",
      color: "var(--blue)"
    }
  ]);

  const toggleViolenceType = (type: string) => {
    setViolenceTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleNeed = (need: string) => {
    setNeeds(prev => 
      prev.includes(need) ? prev.filter(n => n !== need) : [...prev, need]
    );
  };

  // Helper to map checkbox answers to a single TipoViolencia enum using requested priorities
  const mapToTipoViolencia = (types: string[]): TipoViolencia => {
    if (types.some(t => t.toLowerCase().includes("física"))) return "FISICA";
    if (types.some(t => t.toLowerCase().includes("sexual"))) return "SEXUAL";
    if (types.some(t => t.toLowerCase().includes("ameaça") || t.toLowerCase().includes("perseguição"))) return "MORAL";
    if (types.some(t => t.toLowerCase().includes("psicológica"))) return "PSICOLOGICA";
    if (types.some(t => t.toLowerCase().includes("patrimonial"))) return "PATRIMONIAL";
    return "PSICOLOGICA"; // default fallback
  };

  const handleFinishTriage = async () => {
    const isHighUrgency = 
      hasWeapon === "Sim" || 
      sharesHome === "Sim" || 
      recentAggression === "Sim" || 
      violenceTypes.some(t => t.toLowerCase().includes("física")) ||
      violenceTypes.some(t => t.toLowerCase().includes("ameaça") || t.toLowerCase().includes("perseguição"));

    const severity = isHighUrgency ? "Alta" : "Moderada";
    const mappedType = mapToTipoViolencia(violenceTypes);
    
    // Construct description ensuring it is >= 20 characters
    let descricao = `Violências relatadas: ${violenceTypes.join(", ")}. Arma: ${hasWeapon}. Mora junto: ${sharesHome}. Agressão 48h: ${recentAggression}. Suporte necessário: ${needs.join(", ")}.`;
    if (descricao.length < 20) {
      descricao = "Relato detalhado da triagem de violência: " + descricao;
    }

    try {
      // Call backend API
      const caseRes = await casoService.abrirCaso({
        tipoViolencia: mappedType,
        descricao: descricao
      });

      if (caseRes.data && caseRes.data.id) {
        localStorage.setItem("active_case_id", caseRes.data.id);
      }
      
      setUrgencyLevel(severity);
      setTriageCompleted(true);
      localStorage.setItem("triage_completed", "true");
      localStorage.setItem("triage_urgency", severity);

      alert("Triagem concluída com sucesso! Analisamos suas respostas e identificamos as melhores diretrizes de segurança.");
      setActiveTab("triagem");
    } catch (error) {
      console.warn("Erro ao criar caso no backend. Rodando simulação local...", error);
      
      setUrgencyLevel(severity);
      setTriageCompleted(true);
      localStorage.setItem("triage_completed", "true");
      localStorage.setItem("triage_urgency", severity);

      alert("Triagem concluída com sucesso (Modo Simulado)! Analisamos suas respostas e identificamos as melhores diretrizes de segurança.");
      setActiveTab("triagem");
    }
  };

  const handleResetTriage = () => {
    if (confirm("Deseja refazer a sua triagem? Isso redefinirá suas respostas atuais.")) {
      setTriageCompleted(false);
      setLawyerAccepted(false);
      setTriageStep(1);
      setViolenceTypes([]);
      setHasWeapon("");
      setSharesHome("");
      setRecentAggression("");
      setNeeds([]);
      localStorage.removeItem("active_case_id");
      localStorage.removeItem("triage_completed");
      localStorage.removeItem("triage_urgency");
      localStorage.removeItem("chat_accepted");
      localStorage.removeItem("chat_carlamendes");
    }
  };

  const handleSimulateAccept = () => {
    setLawyerAccepted(true);
    localStorage.setItem("chat_accepted", "true");
    alert("Dra. Carla Mendes aceitou o seu atendimento voluntário!");
  };

  const handleConnectAdvocate = () => {
    localStorage.setItem("chat_carlamendes", "true");
    alert("Conexão estabelecida! Um canal de chat criptografado seguro com a Dra. Carla Mendes foi aberto.");
    navigate("/chat");
  };

  return (
    <div className="page active" id="page-dashboard" style={{ paddingTop: "64px", minHeight: "100vh" }}>
      <div className="dashboard">
        {/* Sidebar */}
        <div className="dash-sidebar">
          <div className="dash-user">
            <div className="dash-user-avatar">M</div>
            <div className="dash-user-info">
              <strong>{victimName}</strong>
              <span>Usuária verificada</span>
            </div>
          </div>
          <div className="dash-menu">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${activeTab === "overview" ? "bg-white/10 text-white font-medium" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
              style={{ background: activeTab === "overview" ? "rgba(255,255,255,0.12)" : "transparent", color: "#fff", border: "none", cursor: "pointer", font: "inherit" }}
            >
              <i className="fas fa-th-large w-5 text-center"></i> Visão Geral
            </button>
            
            <button
              onClick={() => setActiveTab("triagem")}
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${activeTab === "triagem" ? "bg-white/10 text-white font-medium" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
              style={{ background: activeTab === "triagem" ? "rgba(255,255,255,0.12)" : "transparent", color: "#fff", border: "none", cursor: "pointer", font: "inherit" }}
            >
              <i className="fas fa-clipboard-list w-5 text-center"></i> Triagem e Suporte
            </button>

            <button
              onClick={() => setActiveTab("status")}
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${activeTab === "status" ? "bg-white/10 text-white font-medium" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
              style={{ background: activeTab === "status" ? "rgba(255,255,255,0.12)" : "transparent", color: "#fff", border: "none", cursor: "pointer", font: "inherit" }}
            >
              <i className="fas fa-tasks w-5 text-center"></i> Status do Caso
            </button>
            <button
              onClick={() => setActiveTab("msgs")}
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${activeTab === "msgs" ? "bg-white/10 text-white font-medium" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
              style={{ background: activeTab === "msgs" ? "rgba(255,255,255,0.12)" : "transparent", color: "#fff", border: "none", cursor: "pointer", font: "inherit" }}
            >
              <i className="fas fa-envelope w-5 text-center"></i> Mensagens 
              <span className="unread" style={{ marginLeft: "auto" }}>1</span>
            </button>
            <Link 
              to="/chat" 
              className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition text-white/70 hover:bg-white/5 hover:text-white decoration-transparent"
              style={{ color: "#fff", textDecoration: "none" }}
            >
              <i className="fas fa-comments w-5 text-center"></i> Chat Seguro
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="dash-content">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div id="dash-overview" className="dash-tab active">
              <div className="dash-header">
                <h2>Bem-vinda, {victimName.split(" ")[0]} 👋</h2>
                <span className={`badge ${triageCompleted ? "badge-green" : "badge-amber"}`}>
                  <i className="fas fa-circle" style={{ fontSize: "8px" }}></i> {triageCompleted ? "Triagem realizada" : "Triagem pendente"}
                </span>
              </div>
              
              {!triageCompleted ? (
                <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "var(--r2)", padding: "32px", textAlign: "center", boxShadow: "var(--shadow)", marginBottom: "28px" }}>
                  <i className="fas fa-clipboard-list text-wine mb-4" style={{ fontSize: "48px", color: "var(--wine)" }}></i>
                  <h3 style={{ fontSize: "20px", color: "var(--wine)", marginBottom: "12px", fontFamily: "Playfair Display, serif" }}>Complete sua Triagem</h3>
                  <p style={{ color: "var(--mid)", maxWidth: "540px", margin: "0 auto 24px", fontSize: "14.5px" }}>
                    Para conectá-la a uma advogada voluntária e entender sua situação de forma confidencial e segura, precisamos que responda a algumas perguntas simples.
                  </p>
                  <button onClick={() => setActiveTab("triagem")} className="btn btn-wine">
                    <i className="fas fa-arrow-right"></i> Começar Triagem Agora
                  </button>
                </div>
              ) : (
                <div className="dash-cards">
                  <div className="dash-card">
                    <div className="dash-card-icon" style={{ background: "var(--blush)", color: "var(--wine)" }}>
                      <i className="fas fa-gavel"></i>
                    </div>
                    <span>Protocolo</span>
                    <strong>#JA-2025-4821</strong>
                    <small>Aberto em 15/05/2025</small>
                  </div>
                  <div className="dash-card">
                    <div className="dash-card-icon" style={{ background: "#e6f5ef", color: "var(--green)" }}>
                      <i className="fas fa-user-tie"></i>
                    </div>
                    <span>Status Triagem</span>
                    <strong>{urgencyLevel === "Alta" ? "Risco Alto 🚨" : "Risco Moderado ⚠️"}</strong>
                    <small>Triagem analisada</small>
                  </div>
                  <div className="dash-card">
                    <div className="dash-card-icon" style={{ background: "#e8eef8", color: "var(--blue)" }}>
                      <i className="fas fa-clock"></i>
                    </div>
                    <span>Status Chat</span>
                    <strong>{lawyerAccepted ? "Advogado Conectado" : "Aguardando Aceite"}</strong>
                    <small>{lawyerAccepted ? "Dra. Carla Mendes" : "Buscando profissional"}</small>
                  </div>
                </div>
              )}

              {/* Status bar quick view */}
              <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "var(--r2)", padding: "24px", marginBottom: "24px", boxShadow: "var(--shadow)" }}>
                <h3 style={{ fontSize: "16px", color: "var(--wine)", marginBottom: "20px" }}>Etapas do sistema</h3>
                <div className="status-bar">
                  <div className={`status-step ${triageCompleted ? "done" : "active"}`}><div className="status-dot">{triageCompleted ? <i className="fas fa-check"></i> : "1"}</div><p>Triagem</p></div>
                  <div className={`status-step ${triageCompleted && !lawyerAccepted ? "active" : (triageCompleted && lawyerAccepted ? "done" : "")}`}><div className="status-dot">{triageCompleted && lawyerAccepted ? <i className="fas fa-check"></i> : "2"}</div><p>Aceite do Advogado</p></div>
                  <div className={`status-step ${triageCompleted && lawyerAccepted ? "active" : ""}`}><div className="status-dot">3</div><p>Atendimento Chat</p></div>
                  <div className="status-step"><div className="status-dot">4</div><p>Acompanhamento</p></div>
                </div>
              </div>

              {triageCompleted && (
                <div style={{ background: "var(--blush)", border: "1px solid var(--rose)", borderRadius: "var(--r)", padding: "14px 18px", display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", color: "var(--wine)" }}>
                  <i className="fas fa-info-circle"></i>
                  <span>
                    <strong>Sua triagem foi concluída com sucesso.</strong> 
                    {lawyerAccepted ? (
                      <span> A Dra. Carla Mendes aceitou seu caso! Vá na aba de <strong>Triagem</strong> para iniciar a conversa.</span>
                    ) : (
                      <span> Aguardando a conexão com um advogado voluntário. Veja as sugestões de segurança na aba de <strong>Triagem</strong>.</span>
                    )}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TRIAGEM TAB */}
          {activeTab === "triagem" && (
            <div id="dash-triagem" className="dash-tab active">
              <div className="dash-header">
                <h2>Sistema de Triagem</h2>
                {triageCompleted && (
                  <button onClick={handleResetTriage} className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: "12.5px" }}>
                    <i className="fas fa-undo"></i> Refazer Triagem
                  </button>
                )}
              </div>

              {!triageCompleted ? (
                // WIZARD FORM
                <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "var(--r2)", padding: "32px", boxShadow: "var(--shadow)" }}>
                  {/* Progress Indicators */}
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "28px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
                    <span style={{ fontWeight: triageStep === 1 ? "bold" : "normal", color: triageStep === 1 ? "var(--wine)" : "var(--soft)" }}>1. O que aconteceu</span>
                    <span style={{ fontWeight: triageStep === 2 ? "bold" : "normal", color: triageStep === 2 ? "var(--wine)" : "var(--soft)" }}>2. Fatores de Risco</span>
                    <span style={{ fontWeight: triageStep === 3 ? "bold" : "normal", color: triageStep === 3 ? "var(--wine)" : "var(--soft)" }}>3. Apoio Necessário</span>
                  </div>

                  {/* STEP 1: Violence Types */}
                  {triageStep === 1 && (
                    <div>
                      <h3 style={{ fontSize: "18px", color: "var(--wine)", marginBottom: "8px", fontFamily: "Playfair Display, serif" }}>Que tipo de violência você tem sofrido?</h3>
                      <p style={{ color: "var(--mid)", fontSize: "13.5px", marginBottom: "20px" }}>Você pode marcar mais de uma opção se desejar.</p>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                        {[
                          "Violência Física (agressões, empurrões, machucados)",
                          "Violência Psicológica/Verbal (humilhações, xingamentos, controle, ciúme excessivo)",
                          "Violência Sexual (sexo forçado, importunação)",
                          "Violência Patrimonial/Financeira (destruição de pertences, controle de dinheiro)",
                          "Ameaças e Perseguição (mensagens ameaçadoras, rondar a casa/trabalho)"
                        ].map(type => (
                          <label key={type} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", border: "1px solid var(--border)", borderRadius: "8px", cursor: "pointer", transition: "0.2s", background: violenceTypes.includes(type) ? "var(--warm)" : "transparent" }}>
                            <input 
                              type="checkbox" 
                              checked={violenceTypes.includes(type)}
                              onChange={() => toggleViolenceType(type)}
                              style={{ width: "16px", height: "16px", accentColor: "var(--wine)" }}
                            />
                            <span style={{ fontSize: "14px", color: "var(--slate)" }}>{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Risk Factors */}
                  {triageStep === 2 && (
                    <div>
                      <h3 style={{ fontSize: "18px", color: "var(--wine)", marginBottom: "8px", fontFamily: "Playfair Display, serif" }}>Perguntas sobre Fatores de Risco</h3>
                      <p style={{ color: "var(--mid)", fontSize: "13.5px", marginBottom: "20px" }}>Essas informações nos ajudam a avaliar a urgência do seu caso.</p>

                      <div style={{ display: "flex", flexDirection: "column", gap: "18px", marginBottom: "24px" }}>
                        <div>
                          <p style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "8px", color: "var(--slate)" }}>O agressor tem acesso a armas de fogo ou outras armas?</p>
                          <div style={{ display: "flex", gap: "14px" }}>
                            {["Sim", "Não", "Não sei"].map(opt => (
                              <label key={opt} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                                <input type="radio" name="weapon" checked={hasWeapon === opt} onChange={() => setHasWeapon(opt)} style={{ accentColor: "var(--wine)" }} />
                                <span style={{ fontSize: "14px" }}>{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "8px", color: "var(--slate)" }}>O agressor mora na mesma casa que você?</p>
                          <div style={{ display: "flex", gap: "14px" }}>
                            {["Sim", "Não"].map(opt => (
                              <label key={opt} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                                <input type="radio" name="sharesHome" checked={sharesHome === opt} onChange={() => setSharesHome(opt)} style={{ accentColor: "var(--wine)" }} />
                                <span style={{ fontSize: "14px" }}>{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "8px", color: "var(--slate)" }}>Houve agressões físicas ou ameaças graves nas últimas 48 horas?</p>
                          <div style={{ display: "flex", gap: "14px" }}>
                            {["Sim", "Não"].map(opt => (
                              <label key={opt} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                                <input type="radio" name="recentAggression" checked={recentAggression === opt} onChange={() => setRecentAggression(opt)} style={{ accentColor: "var(--wine)" }} />
                                <span style={{ fontSize: "14px" }}>{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Needs */}
                  {triageStep === 3 && (
                    <div>
                      <h3 style={{ fontSize: "18px", color: "var(--wine)", marginBottom: "8px", fontFamily: "Playfair Display, serif" }}>De qual suporte jurídico você precisa hoje?</h3>
                      <p style={{ color: "var(--mid)", fontSize: "13.5px", marginBottom: "20px" }}>Selecione as opções que fazem sentido para você.</p>

                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                        {[
                          "Solicitação de Medida Protetiva de Urgência (afastamento do agressor)",
                          "Direito de Família (divórcio, partilha de bens)",
                          "Questões sobre filhos (guarda provisória, pensão alimentícia)",
                          "Apoio para registro de Boletim de Ocorrência seguro",
                          "Apenas orientação jurídica geral"
                        ].map(need => (
                          <label key={need} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", border: "1px solid var(--border)", borderRadius: "8px", cursor: "pointer", transition: "0.2s", background: needs.includes(need) ? "var(--warm)" : "transparent" }}>
                            <input 
                              type="checkbox" 
                              checked={needs.includes(need)}
                              onChange={() => toggleNeed(need)}
                              style={{ width: "16px", height: "16px", accentColor: "var(--wine)" }}
                            />
                            <span style={{ fontSize: "14px", color: "var(--slate)" }}>{need}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Navigation buttons */}
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
                    {triageStep > 1 ? (
                      <button onClick={() => setTriageStep(p => p - 1)} className="btn btn-ghost" style={{ padding: "8px 18px", fontSize: "14px" }}>
                        Voltar
                      </button>
                    ) : <div />}
                    
                    {triageStep < 3 ? (
                      <button 
                        onClick={() => {
                          if (triageStep === 1 && violenceTypes.length === 0) {
                            alert("Por favor, selecione pelo menos uma opção.");
                            return;
                          }
                          if (triageStep === 2 && (!hasWeapon || !sharesHome || !recentAggression)) {
                            alert("Por favor, responda a todas as perguntas de risco.");
                            return;
                          }
                          setTriageStep(p => p + 1);
                        }} 
                        className="btn btn-wine" 
                        style={{ padding: "8px 18px", fontSize: "14px" }}
                      >
                        Próximo
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          if (needs.length === 0) {
                            alert("Por favor, selecione pelo menos um suporte necessário.");
                            return;
                          }
                          handleFinishTriage();
                        }} 
                        className="btn btn-wine" 
                        style={{ padding: "8px 18px", fontSize: "14px", backgroundColor: "var(--green)" }}
                      >
                        Finalizar Triagem
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                // REPORT SUMMARY & SUGGESTIONS BEFORE ADVOCATE ACCEPTS
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "var(--r2)", padding: "28px", boxShadow: "var(--shadow)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
                      <h3 style={{ fontSize: "16.5px", color: "var(--wine)", fontWeight: "bold" }}>Sugestões de Segurança Diante da sua Situação</h3>
                      <span className={`badge ${urgencyLevel === "Alta" ? "badge-wine" : "badge-green"}`} style={{ fontSize: "13px", padding: "6px 14px" }}>
                        Avaliação de Risco: {urgencyLevel === "Alta" ? "Alto 🚨" : "Moderado ⚠️"}
                      </span>
                    </div>

                    <p style={{ fontSize: "14px", color: "var(--mid)", lineHeight: "1.7", marginBottom: "20px" }}>
                      Enquanto aguarda a conexão de um advogado voluntário no nosso sistema, veja abaixo as recomendações mais importantes que você pode adotar imediatamente para se proteger:
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                      <div style={{ background: "var(--cream)", padding: "16px", borderRadius: "8px", borderLeft: "4px solid var(--wine)" }}>
                        <strong style={{ display: "block", fontSize: "14.5px", color: "var(--wine)", marginBottom: "6px" }}><i className="fas fa-phone-alt"></i> 1. Canais de Emergência</strong>
                        <p style={{ fontSize: "13px", color: "var(--slate)", lineHeight: "1.6" }}>
                          Em caso de agressão física ativa ou perigo iminente, ligue imediatamente para <strong>190 (Polícia Militar)</strong> ou <strong>180 (Central de Atendimento à Mulher)</strong>.
                        </p>
                      </div>

                      <div style={{ background: "var(--cream)", padding: "16px", borderRadius: "8px", borderLeft: "4px solid var(--green)" }}>
                        <strong style={{ display: "block", fontSize: "14.5px", color: "var(--green)", marginBottom: "6px" }}><i className="fas fa-key"></i> 2. Plano de Fuga Silencioso</strong>
                        <p style={{ fontSize: "13px", color: "var(--slate)", lineHeight: "1.6" }}>
                          Se morar com o agressor, combine uma palavra-chave com um parente ou vizinho de confiança. Se você enviar essa palavra, eles saberão que devem chamar a polícia.
                        </p>
                      </div>

                      <div style={{ background: "var(--cream)", padding: "16px", borderRadius: "8px", borderLeft: "4px solid var(--blue)" }}>
                        <strong style={{ display: "block", fontSize: "14.5px", color: "var(--blue)", marginBottom: "6px" }}><i className="fas fa-lock"></i> 3. Segurança Digital</strong>
                        <p style={{ fontSize: "13px", color: "var(--slate)", lineHeight: "1.6" }}>
                          Use senhas fortes nos seus dispositivos. Lembre-se de sair da conta da plataforma e apagar o histórico de navegação deste site se o agressor tiver acesso ao seu telefone.
                        </p>
                      </div>

                      <div style={{ background: "var(--cream)", padding: "16px", borderRadius: "8px", borderLeft: "4px solid var(--amber)" }}>
                        <strong style={{ display: "block", fontSize: "14.5px", color: "var(--amber)", marginBottom: "6px" }}><i className="fas fa-bookmark"></i> 4. Guardar Provas</strong>
                        <p style={{ fontSize: "13px", color: "var(--slate)", lineHeight: "1.6" }}>
                          Tire capturas de tela (prints) de conversas de WhatsApp, e-mails ou registros de chamadas ameaçadoras. Guarde-as em um local seguro (como uma pasta secreta ou com alguém de confiança).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Lawyer Match & Status */}
                  <div style={{ background: "var(--white)", border: "2px solid var(--rose)", borderRadius: "var(--r2)", padding: "28px", boxShadow: "var(--shadow2)" }}>
                    <h3 style={{ fontSize: "18px", color: "var(--wine)", marginBottom: "8px", fontFamily: "Playfair Display, serif" }}>Status de Atendimento Jurídico</h3>
                    
                    {!lawyerAccepted ? (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px", background: "var(--warm)", borderRadius: "8px", marginBottom: "20px" }}>
                          <i className="fas fa-spinner fa-spin" style={{ color: "var(--rose)", fontSize: "18px" }}></i>
                          <span style={{ fontSize: "13.5px", color: "var(--slate)", fontWeight: "bold" }}>
                            Buscando advogadas voluntárias disponíveis para aceitar o chamado...
                          </span>
                        </div>
                        
                        <p style={{ fontSize: "13px", color: "var(--mid)", marginBottom: "20px" }}>
                          Enquanto nossa rede analisa sua triagem, avalie as sugestões de segurança acima. Você pode acelerar o teste desta demonstração usando o botão de simulação abaixo.
                        </p>

                        <button 
                          onClick={handleSimulateAccept}
                          className="btn" 
                          style={{ width: "100%", justifyContent: "center", background: "var(--rose)", color: "#fff", border: "none", cursor: "pointer", fontSize: "14px", padding: "10px 16px" }}
                        >
                          <i className="fas fa-user-check"></i> Simular Advogado Aceitar Caso
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap", marginBottom: "20px" }}>
                          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--wine)", color: "#fff", fontSize: "24px", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center" }}>CM</div>
                          <div>
                            <h4 style={{ fontSize: "17px", color: "var(--wine)" }}>Dra. Carla Mendes (Aceitou seu caso)</h4>
                            <span style={{ fontSize: "13px", color: "var(--mid)" }}>OAB/SP 187.432 · Especialista em Violência Doméstica</span>
                            <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                              <span className="tag tag-wine">Violência Doméstica</span>
                              <span className="tag tag-green">Medida Protetiva</span>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={handleConnectAdvocate} 
                          className="btn btn-wine w-full" 
                          style={{ justifyContent: "center", fontSize: "15px", padding: "12px 20px" }}
                        >
                          <i className="fas fa-comments"></i> Iniciar Atendimento via Chat Seguro
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STATUS TAB */}
          {activeTab === "status" && (
            <div id="dash-status" className="dash-tab active">
              <div className="dash-header">
                <h2>Status do Caso</h2>
                <span className="badge badge-wine">Em andamento</span>
              </div>
              <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "var(--r2)", padding: "28px", boxShadow: "var(--shadow)" }}>
                <div className="status-bar" style={{ marginBottom: "28px" }}>
                  <div className="status-step done"><div className="status-dot"><i className="fas fa-check"></i></div><p>BO Registrado</p></div>
                  <div className="status-step done"><div className="status-dot"><i className="fas fa-check"></i></div><p>Caso aberto</p></div>
                  <div className="status-step done"><div className="status-dot"><i className="fas fa-check"></i></div><p>Advogada atribuída</p></div>
                  <div className="status-step active"><div className="status-dot"><i className="fas fa-gavel"></i></div><p>Medida protetiva</p></div>
                  <div className="status-step"><div className="status-dot">5</div><p>Audiência</p></div>
                  <div className="status-step"><div className="status-dot">6</div><p>Encerramento</p></div>
                </div>
                <h4 style={{ color: "var(--wine)", marginBottom: "14px" }}>Linha do tempo</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--green)", marginTop: "5px", flexShrink: 0 }}></div>
                    <div>
                      <strong style={{ fontSize: "13.5px" }}>15/05/2025 — Boletim de Ocorrência registrado</strong>
                      <p style={{ fontSize: "13px", color: "var(--mid)" }}>Delegacia da Mulher de São Paulo — protocolo #2025-04821</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--green)", marginTop: "5px", flexShrink: 0 }}></div>
                    <div>
                      <strong style={{ fontSize: "13.5px" }}>16/05/2025 — Caso aberto na plataforma</strong>
                      <p style={{ fontSize: "13px", color: "var(--mid)" }}>Dra. Carla Mendes atribuída ao caso</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--green)", marginTop: "5px", flexShrink: 0 }}></div>
                    <div>
                      <strong style={{ fontSize: "13.5px" }}>18/05/2025 — Medida protetiva deferida</strong>
                      <p style={{ fontSize: "13px", color: "var(--mid)" }}>Juíza determinou afastamento de 300m e proibição de contato</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--wine)", marginTop: "5px", flexShrink: 0 }}></div>
                    <div>
                      <strong style={{ fontSize: "13.5px", color: "var(--wine)" }}>28/05/2025 — Audiência judicial agendada (próxima etapa)</strong>
                      <p style={{ fontSize: "13px", color: "var(--mid)" }}>Vara de Violência Doméstica — Fórum Central de SP, 14h</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MESSAGES TAB */}
          {activeTab === "msgs" && (
            <div id="dash-msgs" className="dash-tab active">
              <div className="dash-header">
                <h2>Mensagens</h2>
              </div>
              <div className="msgs">
                {messages.map(msg => (
                  <div key={msg.id} className="msg-item" style={{ borderLeft: msg.status === "Nova" ? "3px solid var(--wine)" : "none" }}>
                    <div className="msg-avatar" style={{ background: msg.color, color: "#fff" }}>
                      {msg.avatar}
                    </div>
                    <div className="msg-body">
                      <strong>{msg.sender}</strong>
                      <time>{msg.time}</time>
                      <p>{msg.content}</p>
                    </div>
                    <span className={`badge ${msg.status === "Nova" ? "badge-wine" : "badge-green"}`}>
                      {msg.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}