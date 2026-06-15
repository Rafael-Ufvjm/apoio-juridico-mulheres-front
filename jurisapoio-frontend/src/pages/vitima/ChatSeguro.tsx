import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

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
  id: number;
  sender: "user" | "other";
  avatar: string;
  avatarColor: string;
  content: string;
  time: string;
}

export function ChatSeguro() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeContactId, setActiveContactId] = useState<number>(2); // Default to Support if nothing else is active
  const [chatMessages, setChatMessages] = useState<Record<number, Message[]>>({
    2: [
      {
        id: 1,
        sender: "other",
        avatar: "shield",
        avatarColor: "var(--blue)",
        content: "Olá! Bem-vinda ao chat de suporte do JurisApoio. Como podemos ajudar com a segurança do site hoje?",
        time: "Agora"
      }
    ]
  });

  const [inputVal, setInputVal] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load contacts based on Triage connection state
  useEffect(() => {
    const isConnected = localStorage.getItem("chat_carlamendes") === "true";
    
    const initialContacts: Contact[] = [
      {
        id: 2,
        name: "Suporte JurisApoio",
        avatar: "shield",
        lastMessage: "Como podemos ajudar com a...",
        time: "Agora",
        isOnline: true,
        avatarColor: "var(--blue)",
        isSupport: true
      }
    ];

    if (isConnected) {
      initialContacts.unshift({
        id: 1,
        name: "Dra. Carla Mendes",
        avatar: "CM",
        lastMessage: "Olá, Maria. Analisei o resultado da...",
        time: "10:23",
        unreadCount: 1,
        isOnline: true,
        avatarColor: "var(--wine)"
      });
      setActiveContactId(1); // Auto select Carla if she is matched

      // Load messages for Carla
      setChatMessages(prev => ({
        ...prev,
        1: [
          {
            id: 1,
            sender: "other",
            avatar: "CM",
            avatarColor: "var(--wine)",
            content: "Olá, Maria. Analisei o resultado da sua triagem e os fatores de risco apontados. Quero que saiba que você está segura aqui. Vamos trabalhar juntas no seu caso.",
            time: "10:05"
          },
          {
            id: 2,
            sender: "other",
            avatar: "CM",
            avatarColor: "var(--wine)",
            content: "O primeiro passo é providenciarmos o pedido da sua Medida Protetiva de Urgência. Se você puder, tenha em mãos o seu Comprovante de Residência e o Boletim de Ocorrência (se já houver registrado) para que possamos anexar no processo judicial.",
            time: "10:06"
          }
        ]
      }));
    } else {
      setActiveContactId(2);
    }

    setContacts(initialContacts);
  }, []);

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

  const handleSendMessage = () => {
    const trimmed = inputVal.trim();
    if (!trimmed || !activeContactId) return;

    const newMsg: Message = {
      id: Date.now(),
      sender: "user",
      avatar: "M",
      avatarColor: "var(--rose)",
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
                    <button className="icon-btn" title="Chamada de vídeo" onClick={() => alert("Vídeo chamada segura desativada no modo demonstração")}><i className="fas fa-video"></i></button>
                    <button className="icon-btn" title="Informações" onClick={() => alert("Informações da advogada voluntária")}><i className="fas fa-info-circle"></i></button>
                  </div>
                </div>

                <div className="chat-privacy-bar">
                  <i className="fas fa-lock"></i> Conversa criptografada ponta a ponta · Suas mensagens são privadas e seguras · Protocolo #JA-2025-4821
                </div>

                <div className="chat-messages">
                  {messagesList.map(msg => (
                    <div key={msg.id} className={`chat-msg ${msg.sender === "user" ? "sent" : "recv"}`}>
                      <div className="msg-avt" style={{ background: msg.avatarColor, color: "#fff" }}>
                        {msg.avatar === "shield" ? <i className="fas fa-shield-alt" style={{ fontSize: "12px" }}></i> : msg.avatar}
                      </div>
                      <div>
                        <div className="msg-bubble">{msg.content}</div>
                        <div className="msg-time">{msg.time}</div>
                      </div>
                    </div>
                  ))}
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
