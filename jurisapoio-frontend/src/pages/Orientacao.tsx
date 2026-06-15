import { useState } from "react";

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: "Medida Protetiva" | "Denúncia" | "Direitos";
}

const faqData: FaqItem[] = [
  {
    id: 1,
    question: "O que é a Lei Maria da Penha?",
    answer: "A Lei 11.340/2006, conhecida como Lei Maria da Penha, cria mecanismos para coibir e prevenir a violência doméstica e familiar contra a mulher. Ela define os tipos de violência (física, psicológica, sexual, patrimonial e moral) e prevê medidas protetivas, delegacias especializadas, varas exclusivas e penas mais severas para os agressores.",
    category: "Direitos"
  },
  {
    id: 2,
    question: "Como solicitar uma medida protetiva?",
    answer: "Você pode solicitar a medida protetiva diretamente na Delegacia de Atendimento à Mulher (DEAM) ou em qualquer delegacia. A solicitação também pode ser feita pelo Ministério Público ou pelo advogado. Após o pedido, o juiz tem 48 horas para decidir. A medida protetiva pode proibir o agressor de se aproximar, contatar ou frequentar os mesmos lugares que você.",
    category: "Medida Protetiva"
  },
  {
    id: 3,
    question: "Posso registrar BO mesmo sem provas físicas?",
    answer: "Sim. A sua palavra tem valor legal. Registrar o boletim de ocorrência é fundamental mesmo sem provas físicas imediatas. Testemunhos, histórico de mensagens, e-mails, prints de redes sociais e relatos consistentes são aceitos como evidências. Recomendamos guardar tudo que possa documentar a situação.",
    category: "Denúncia"
  },
  {
    id: 4,
    question: "O que acontece após eu denunciar?",
    answer: "Após o registro do BO, a polícia encaminha o caso ao Ministério Público, que decide se abre inquérito. O juiz pode decretar medidas protetivas de urgência em até 48 horas. O processo penal é conduzido pelo Estado — você não precisa 'sustentá-lo'. Você pode acompanhar o andamento com a ajuda do seu advogado voluntário.",
    category: "Denúncia"
  },
  {
    id: 5,
    question: "Posso retirar a denúncia depois?",
    answer: "Na Lei Maria da Penha, você pode renunciar à representação apenas em audiência judicial e antes do recebimento da denúncia. Para crimes de ação penal pública incondicionada (como lesão corporal), a ação penal prossegue mesmo sem sua solicitação. É fundamental conversar com um advogado antes de qualquer decisão nesse sentido.",
    category: "Direitos"
  }
];

export function Orientacao() {
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [openFaqIds, setOpenFaqIds] = useState<number[]>([1]); // First FAQ open by default

  const toggleFaq = (id: number) => {
    setOpenFaqIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const categories = ["Todas", "Medida Protetiva", "Denúncia", "Direitos"];

  const filteredFaqs = activeCategory === "Todas"
    ? faqData
    : faqData.filter(faq => faq.category === activeCategory);

  return (
    <div className="page active" id="page-orientacao">
      <section style={{ background: "linear-gradient(135deg, var(--wine3), var(--wine))", color: "#fff", padding: "60px 24px" }}>
        <div className="section-inner" style={{ marginBottom: 0 }}>
          <div className="section-tag" style={{ background: "rgba(255, 255, 255, 0.15)", color: "#fff" }}>Orientação Jurídica</div>
          <h2 className="section-title" style={{ color: "#fff" }}>Conheça seus direitos</h2>
          <p className="section-sub" style={{ color: "rgba(255, 255, 255, 0.8)", marginBottom: 0 }}>
            Informações claras, em linguagem acessível, sobre seus direitos como mulher vítima de violência.
          </p>
        </div>
      </section>

      <section>
        <div className="section-inner">
          {/* RIGHTS CARDS */}
          <div className="section-tag">Direitos fundamentais</div>
          <h2 className="section-title">O que a lei garante a você</h2>
          <div className="rights-grid" style={{ marginBottom: "48px" }}>
            <div className="right-card">
              <div className="right-card-icon" style={{ background: "var(--blush)", color: "var(--wine)" }}>
                <i className="fas fa-shield-alt"></i>
              </div>
              <h4>Medida Protetiva de Urgência</h4>
              <p>Garantida pela Lei Maria da Penha (Lei 11.340/2006). O juiz pode determinar o afastamento do agressor em até 48 horas após o pedido.</p>
            </div>
            <div className="right-card">
              <div className="right-card-icon" style={{ background: "#e6f5ef", color: "var(--green)" }}>
                <i className="fas fa-file-alt"></i>
              </div>
              <h4>Boletim de Ocorrência</h4>
              <p>Pode ser registrado em qualquer delegacia, 24 horas por dia. Também disponível online em muitos estados. É gratuito e fundamental para a proteção legal.</p>
            </div>
            <div className="right-card">
              <div className="right-card-icon" style={{ background: "#e8eef8", color: "var(--blue)" }}>
                <i className="fas fa-home"></i>
              </div>
              <h4>Direito à moradia</h4>
              <p>Você tem direito a permanecer na residência do casal. O agressor pode ser obrigado a se retirar do imóvel por determinação judicial.</p>
            </div>
            <div className="right-card">
              <div className="right-card-icon" style={{ background: "#fef3e2", color: "var(--amber)" }}>
                <i className="fas fa-user-shield"></i>
              </div>
              <h4>Assistência jurídica gratuita</h4>
              <p>O JurisApoio conecta você com advogados voluntários que prestam assistência jurídica gratuita em todo o país, sem custo algum.</p>
            </div>
            <div className="right-card">
              <div className="right-card-icon" style={{ background: "var(--blush)", color: "var(--wine)" }}>
                <i className="fas fa-hospital"></i>
              </div>
              <h4>Atendimento de saúde</h4>
              <p>O SUS oferece atendimento especializado para vítimas de violência, incluindo coleta de evidências, profilaxia e acompanhamento psicológico.</p>
            </div>
            <div className="right-card">
              <div className="right-card-icon" style={{ background: "#e6f5ef", color: "var(--green)" }}>
                <i className="fas fa-child"></i>
              </div>
              <h4>Guarda dos filhos</h4>
              <p>A violência doméstica é fator determinante nas decisões de guarda. Você pode solicitar guarda provisória urgente em situações de risco.</p>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="section-tag">Perguntas frequentes</div>
          <h2 className="section-title">Dúvidas comuns</h2>
          <div className="faq-cats" style={{ marginBottom: "24px" }}>
            {categories.map(cat => (
              <button
                key={cat}
                className={`faq-cat ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="faq-list">
            {filteredFaqs.map(faq => {
              const isOpen = openFaqIds.includes(faq.id);
              return (
                <div className="faq-item" key={faq.id}>
                  <div className="faq-q" onClick={() => toggleFaq(faq.id)}>
                    <span>{faq.question}</span>
                    <i 
                      className="fas fa-chevron-down" 
                      style={{ 
                        transform: isOpen ? "rotate(180deg)" : "none",
                        transition: "transform 0.2s"
                      }}
                    ></i>
                  </div>
                  {isOpen && (
                    <div className="faq-a">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
