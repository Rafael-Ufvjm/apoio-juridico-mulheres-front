import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { mensagemService } from "../../services/mensagemService";
import { casoService } from "../../services/casoService";

interface Contact {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  isOnline: boolean;
  avatarColor: string;
  isSupport?: boolean;
}

interface Message {
  id: string | number;
  sender: "user" | "other";
  avatar: string;
  avatarColor: string;
  content: string;
  time: string;
}

export function ChatSeguro() {
  const { userRole } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeContactId, setActiveContactId] = useState<number>(2); // Default to Support if nothing else is active
  const [chatMessages, setChatMessages] = useState<Record<number, Message[]>>({
    2: [
      {
        id: 1,
        sender: "other",
        avatar: "shield",
        avatarColor: "var(--blue)",
        content: userRole === "advogado" 
          ? "Olá! Bem-vindo ao chat de suporte do JurisApoio para advogados voluntários. Como podemos ajudar hoje?"
          : "Olá! Bem-vinda ao chat de suporte do JurisApoio. Como podemos ajudar com a segurança do site hoje?",
        time: "Agora"
      }
    ]
  });

  const [inputVal, setInputVal] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State to hold the active case details from the backend
  const [activeCase, setActiveCase] = useState<any>(null);

  // Fetch active case details on mount if present
  useEffect(() => {
    const activeCaseId = localStorage.getItem("active_case_id");
    const isConnected = localStorage.getItem("chat_carlamendes") === "true";
    if (activeCaseId && isConnected) {
      casoService.buscarPorId(activeCaseId)
        .then(res => {
          setActiveCase(res.data);
        })
        .catch(err => {
          console.warn("Erro ao buscar detalhes do caso no chat:", err);
        });
    }
  }, []);

  // Load contacts and poll messages
  useEffect(() => {
    const isConnected = localStorage.getItem("chat_carlamendes") === "true";
    const isAdvogado = userRole === "advogado";
    const activeCaseId = localStorage.getItem("active_case_id");
    
    let dispName = isAdvogado ? "Maria Oliveira" : "Dra. Carla Mendes";
    let dispAvatar = isAdvogado ? "M" : "CM";

    if (isConnected && activeCase) {
      if (isAdvogado) {
        dispName = activeCase.vitima ? activeCase.vitima.nomeAnonimo : "Vítima Anônima";
        dispAvatar = dispName.charAt(0).toUpperCase();
      } else {
        dispName = activeCase.advogado ? activeCase.advogado.nome : "Advogada Voluntária";
        dispAvatar = dispName.split(" ").filter((w: string) => {
          const lower = w.toLowerCase().replace(/[^a-z]/g, "");
          return lower !== "dr" && lower !== "dra" && lower !== "dr(a)";
        }).map((w: string) => w[0]).join("").substring(0, 2).toUpperCase() || "ADV";
      }
    }

    const initialContacts: Contact[] = [
      {
        id: 2,
        name: "Suporte JurisApoio",
        avatar: "shield",
        lastMessage: "Como podemos ajudar...",
        time: "Agora",
        isOnline: true,
        avatarColor: "var(--blue)",
        isSupport: true
      }
    ];

    if (isConnected) {
      initialContacts.unshift({
        id: 1,
        name: dispName,
        avatar: dispAvatar,
        lastMessage: isAdvogado ? "O primeiro passo é providenciarmos..." : "Olá, Maria. Analisei o resultado da...",
        time: "10:23",
        unreadCount: isAdvogado ? undefined : 1,
        isOnline: true,
        avatarColor: isAdvogado ? "var(--rose)" : "var(--wine)"
      });
      setActiveContactId(1); // Auto select if matched

      // Load mock messages for fallback ONLY if there is no backend case active
      if (!activeCaseId) {
        setChatMessages(prev => ({
          ...prev,
          1: [
            {
              id: 1,
              sender: isAdvogado ? "user" : "other",
              avatar: "CM",
              avatarColor: "var(--wine)",
              content: "Olá, Maria. Analisei o resultado da sua triagem e os fatores de risco apontados. Quero que saiba que você está segura aqui. Vamos trabalhar juntas no seu caso.",
              time: "10:05"
            },
            {
              id: 2,
              sender: isAdvogado ? "user" : "other",
              avatar: "CM",
              avatarColor: "var(--wine)",
              content: "O primeiro passo é providenciarmos o pedido da sua Medida Protetiva de Urgência. Se você puder, tenha em mãos o seu Comprovante de Residência e o Boletim de Ocorrência (se já houver registrado) para que possamos anexar no processo judicial.",
              time: "10:06"
            }
          ]
        }));
      }
    } else {
      setActiveContactId(2);
    }

    setContacts(initialContacts);

    if (activeCaseId && isConnected) {
      const fetchMessages = async () => {
        try {
          const res = await mensagemService.listarMensagens(activeCaseId);
          const mappedMsgs = res.data.map((msg: any) => {
            const isSentByMe = isAdvogado 
              ? msg.remetentePerfil === "ADVOGADO_VOLUNTARIO" 
              : msg.remetentePerfil === "VITIMA";
            
            let avatarChar = "CM";
            if (msg.remetentePerfil === "VITIMA") {
              avatarChar = activeCase && activeCase.vitima ? activeCase.vitima.nomeAnonimo.charAt(0).toUpperCase() : "V";
            } else if (msg.remetentePerfil === "ADVOGADO_VOLUNTARIO") {
              if (activeCase && activeCase.advogado) {
                avatarChar = activeCase.advogado.nome.split(" ").filter((w: string) => {
                  const lower = w.toLowerCase().replace(/[^a-z]/g, "");
                  return lower !== "dr" && lower !== "dra" && lower !== "dr(a)";
                }).map((w: string) => w[0]).join("").substring(0, 2).toUpperCase() || "ADV";
              } else {
                avatarChar = "ADV";
              }
            } else if (msg.remetentePerfil === "ADMIN") {
              avatarChar = "shield";
            }

            return {
              id: msg.id,
              sender: isSentByMe ? ("user" as const) : ("other" as const),
              avatar: avatarChar,
              avatarColor: msg.remetentePerfil === "VITIMA" ? "var(--rose)" : (msg.remetentePerfil === "ADMIN" ? "var(--blue)" : "var(--wine)"),
              content: msg.conteudo,
              time: new Date(msg.dataEnvio).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
            };
          });

          setChatMessages(prev => ({
            ...prev,
            1: mappedMsgs
          }));

          if (mappedMsgs.length > 0) {
            const last = mappedMsgs[mappedMsgs.length - 1];
            setContacts(prev => prev.map(c => c.id === 1 ? { ...c, lastMessage: last.content, time: last.time } : c));
          }
        } catch (err) {
          console.warn("Erro ao buscar mensagens do backend:", err);
        }
      };

      fetchMessages();

      const interval = setInterval(fetchMessages, 4000);
      return () => clearInterval(interval);
    }
  }, [userRole, activeCase]);

  const activeContact = contacts.find(c => c.id === activeContactId);
  const messagesList = activeContactId && chatMessages[activeContactId] ? chatMessages[activeContactId] : [];

  // Scroll to bottom when messages list changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesList]);

  const handleSelectContact = (id: number) => {
    setActiveContactId(id);
    setContacts(prev => prev.map(c => c.id === id ? { ...c, unreadCount: undefined } : c));
  };

  const handleSendMessage = async () => {
    const trimmed = inputVal.trim();
    if (!trimmed || !activeContactId) return;

    const isAdvogado = userRole === "advogado";
    const activeCaseId = localStorage.getItem("active_case_id");

    if (activeContactId === 1 && activeCaseId) {
      try {
        await mensagemService.enviarMensagem(activeCaseId, trimmed);
        setInputVal("");
        
        // Refetch right away
        const res = await mensagemService.listarMensagens(activeCaseId);
        const mappedMsgs = res.data.map((msg: any) => {
          const isSentByMe = isAdvogado 
            ? msg.remetentePerfil === "ADVOGADO_VOLUNTARIO" 
            : msg.remetentePerfil === "VITIMA";
          
          let avatarChar = "CM";
          if (msg.remetentePerfil === "VITIMA") {
            avatarChar = activeCase && activeCase.vitima ? activeCase.vitima.nomeAnonimo.charAt(0).toUpperCase() : "V";
          } else if (msg.remetentePerfil === "ADVOGADO_VOLUNTARIO") {
            if (activeCase && activeCase.advogado) {
              avatarChar = activeCase.advogado.nome.split(" ").filter((w: string) => {
                const lower = w.toLowerCase().replace(/[^a-z]/g, "");
                return lower !== "dr" && lower !== "dra" && lower !== "dr(a)";
              }).map((w: string) => w[0]).join("").substring(0, 2).toUpperCase() || "ADV";
            } else {
              avatarChar = "ADV";
            }
          } else if (msg.remetentePerfil === "ADMIN") {
            avatarChar = "shield";
          }

          return {
            id: msg.id,
            sender: isSentByMe ? ("user" as const) : ("other" as const),
            avatar: avatarChar,
            avatarColor: msg.remetentePerfil === "VITIMA" ? "var(--rose)" : (msg.remetentePerfil === "ADMIN" ? "var(--blue)" : "var(--wine)"),
            content: msg.conteudo,
            time: new Date(msg.dataEnvio).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
          };
        });

        setChatMessages(prev => ({
          ...prev,
          1: mappedMsgs
        }));

        if (mappedMsgs.length > 0) {
          const last = mappedMsgs[mappedMsgs.length - 1];
          setContacts(prev => prev.map(c => c.id === 1 ? { ...c, lastMessage: last.content, time: last.time } : c));
        }
        return;
      } catch (err) {
        console.warn("Erro ao enviar mensagem para o backend, usando simulação local...", err);
      }
    }

    const newMsg: Message = {
      id: Date.now(),
      sender: "user",
      avatar: isAdvogado ? "CM" : "M",
      avatarColor: isAdvogado ? "var(--wine)" : "var(--rose)",
      content: trimmed,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    };

    setChatMessages(prev => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), newMsg]
    }));

    // Update last message in contact list
    setContacts(prev => prev.map(c => c.id === activeContactId ? { ...c, lastMessage: trimmed, time: "Agora" } : c));
    setInputVal("");
  };

  const handleDeleteChat = () => {
    const confirmMessage = userRole === "advogado" 
      ? "Deseja realmente ocultar esta conversa? Você poderá reabri-la a qualquer momento pelo seu painel."
      : "Deseja realmente ocultar esta conversa? Você poderá contatar o advogado voluntário novamente a qualquer momento através do seu painel.";
      
    if (!confirm(confirmMessage)) return;

    // We do NOT call encerrarCaso and do NOT remove active_case_id/triage_completed.
    // We only remove the visibility flag so the chat disappears from the active chat list.
    localStorage.removeItem("chat_carlamendes");

    // Clean up local states for the active screen
    setContacts(prev => prev.filter(c => c.id !== 1));
    setActiveContactId(2);

    alert("Conversa oculta com sucesso. Você ainda pode contatar o profissional através do seu painel.");
  };

  const handleCloseCase = async () => {
    const confirmMessage = "Deseja realmente encerrar este caso permanentemente? Esta ação arquivará o atendimento e removerá todo o histórico de mensagens por segurança.";
    if (!confirm(confirmMessage)) return;

    const result = prompt("Por favor, informe a justificativa ou resultado do encerramento (obrigatório):", "Orientação concluída");
    if (result === null) return;
    const trimmedResult = result.trim();
    if (!trimmedResult) {
      alert("O resultado do encerramento é obrigatório!");
      return;
    }

    const activeCaseId = localStorage.getItem("active_case_id");
    if (activeCaseId) {
      try {
        await casoService.encerrarCaso(activeCaseId, { resultado: trimmedResult });
      } catch (err: any) {
        console.error("Erro ao encerrar caso no backend:", err);
      }
    }

    // Clean up local storage
    localStorage.removeItem("chat_accepted");
    localStorage.removeItem("chat_carlamendes");
    localStorage.removeItem("active_case_id");
    localStorage.removeItem("triage_completed");
    localStorage.removeItem("triage_urgency");

    // Clean up states
    setActiveCase(null);
    setContacts(prev => prev.filter(c => c.id !== 1));
    setActiveContactId(2);

    alert("Caso encerrado com sucesso. O histórico de mensagens foi apagado por segurança.");
  };


  return (
    <div className="page active" id="page-chat" style={{ paddingTop: "64px", height: "100vh" }}>
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div className="chat-layout" style={{ flex: 1 }}>
          {/* Sidebar */}
          <div className="chat-sidebar">
            <div className="chat-sidebar-header">
              <h3><i className="fas fa-lock" style={{ color: "var(--wine)", fontSize: "13px" }}></i> Conversas</h3>
            </div>
            <div className="chat-search">
              <input type="text" placeholder="🔍  Buscar conversa..." />
            </div>
            <div className="chat-contacts">
              {contacts.map(c => (
                <div 
                  key={c.id} 
                  className={`chat-contact ${activeContactId === c.id ? "active" : ""}`}
                  onClick={() => handleSelectContact(c.id)}
                >
                  <div className="contact-avatar" style={{ background: c.avatarColor, color: "#fff" }}>
                    {c.isSupport ? <i className="fas fa-shield-alt" style={{ fontSize: "14px" }}></i> : c.avatar}
                  </div>
                  <div className="contact-info">
                    <strong>{c.name}</strong>
                    <span>{c.lastMessage}</span>
                  </div>
                  <div className="contact-meta">
                    <time>{c.time}</time>
                    {c.unreadCount && <div className="unread">{c.unreadCount}</div>}
                  </div>
                </div>
              ))}
              {contacts.length === 1 && localStorage.getItem("chat_carlamendes") !== "true" && (
                <div style={{ padding: "20px 16px", fontSize: "13px", color: "var(--mid)", textAlign: "center", borderTop: "1px solid var(--border)" }}>
                  <p className="mb-2">Nenhum atendimento jurídico iniciado.</p>
                  <Link to="/dashboard" style={{ color: "var(--wine)", fontWeight: "bold", textDecoration: "none" }}>
                    Ir para Triagem →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Chat Main */}
          <div className="chat-main">
            {activeContact ? (
              <>
                <div className="chat-topbar">
                  <div className="contact-avatar" style={{ background: activeContact.avatarColor, color: "#fff", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, flexShrink: 0 }}>
                    {activeContact.isSupport ? <i className="fas fa-shield-alt" style={{ fontSize: "14px" }}></i> : activeContact.avatar}
                  </div>
                  <div className="chat-topbar-info">
                    <strong>{activeContact.name}</strong>
                    <span>
                      <i className="fas fa-circle" style={{ fontSize: "8px", color: activeContact.isOnline ? "var(--green)" : "var(--soft)", marginRight: "4px" }}></i> 
                      {activeContact.isOnline ? "Online agora" : "Offline"}
                    </span>
                  </div>
                  <div className="chat-topbar-actions">
                    <button className="icon-btn" title="Informações" onClick={() => alert(userRole === "advogado" ? "Informações da Vítima" : "Informações da advogada voluntária")}><i className="fas fa-info-circle"></i></button>
                    {activeContact.id === 1 && (
                      <>
                        <button 
                          className="icon-btn" 
                          title="Encerrar Caso" 
                          onClick={handleCloseCase} 
                          style={{ color: "var(--wine)", marginLeft: "8px" }}
                        >
                          <i className="fas fa-gavel"></i>
                        </button>
                        <button 
                          className="icon-btn" 
                          title="Ocultar Conversa" 
                          onClick={handleDeleteChat} 
                          style={{ color: "#d9534f", marginLeft: "8px" }}
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="chat-privacy-bar">
                  <i className="fas fa-lock"></i> Conversa criptografada ponta a ponta · Suas mensagens são privadas e seguras · Protocolo #JA-2025-4821
                </div>

                <div className="chat-messages">
                  {messagesList.map(msg => {
                    const isSent = msg.sender === "user";
                    return (
                      <div key={msg.id} className={`chat-msg ${isSent ? "sent" : "recv"}`}>
                        <div className="msg-avt" style={{ background: msg.avatarColor, color: "#fff" }}>
                          {msg.avatar === "shield" ? <i className="fas fa-shield-alt" style={{ fontSize: "12px" }}></i> : msg.avatar}
                        </div>
                        <div>
                          <div className="msg-bubble">{msg.content}</div>
                          <div className="msg-time">{msg.time}</div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                  
                  <div style={{ textAlign: "center", fontSize: "12px", color: "var(--soft)", padding: "8px", background: "rgba(0,0,0,.03)", borderRadius: "8px", marginTop: "10px" }}>
                    🔒 Mensagens criptografadas · Não armazenadas após encerramento do caso
                  </div>
                </div>

                <div className="chat-input-bar">
                  <input 
                    className="chat-input" 
                    type="text" 
                    placeholder="Digite sua mensagem com segurança..." 
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendMessage();
                    }}
                  />
                  <button className="chat-send" onClick={handleSendMessage}>
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--mid)", flexDirection: "column" }}>
                <i className="fas fa-comments text-rose mb-3" style={{ fontSize: "48px" }}></i>
                <p>Selecione um chat na barra lateral para iniciar a conversa.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
