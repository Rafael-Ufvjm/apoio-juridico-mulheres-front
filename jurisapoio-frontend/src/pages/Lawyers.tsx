import { useState } from "react";
import { Link } from "react-router-dom";

interface Lawyer {
  id: number;
  name: string;
  oab: string;
  avatar: string;
  specialties: string[];
  seal: string;
  experience: string;
  cases: string;
  rating: string;
  availability: string;
  color: string;
  gradient: string;
}

const lawyersData: Lawyer[] = [
  {
    id: 1,
    name: "Dra. Carla Mendes",
    oab: "OAB/SP 187.432",
    avatar: "CM",
    specialties: ["Violência Doméstica", "Medida Protetiva"],
    seal: "Advogada Voluntária Verificada",
    experience: "12 anos",
    cases: "340+",
    rating: "⭐ 4.9",
    availability: "24–48h",
    color: "var(--wine)",
    gradient: "linear-gradient(135deg, var(--wine3), var(--wine))"
  },
  {
    id: 2,
    name: "Dr. Rafael Silva",
    oab: "OAB/RJ 213.567",
    avatar: "RS",
    specialties: ["Direito de Família", "Guarda de Filhos"],
    seal: "Advogado Voluntário Verificado",
    experience: "8 anos",
    cases: "210+",
    rating: "⭐ 4.8",
    availability: "12–24h",
    color: "var(--green)",
    gradient: "linear-gradient(135deg, #0d3a2e, #1a5c3a)"
  },
  {
    id: 3,
    name: "Dra. Paula Lima",
    oab: "OAB/MG 142.890",
    avatar: "PL",
    specialties: ["Direito Penal", "Lei Maria da Penha"],
    seal: "Advogada Voluntária Verificada",
    experience: "15 anos",
    cases: "520+",
    rating: "⭐ 5.0",
    availability: "24h",
    color: "var(--blue)",
    gradient: "linear-gradient(135deg, #1a2a4a, #1e4d8c)"
  },
  {
    id: 4,
    name: "Dra. Fernanda Costa",
    oab: "OAB/BA 98.123",
    avatar: "FC",
    specialties: ["Violência Psicológica", "Divórcio"],
    seal: "Advogada Voluntária Verificada",
    experience: "10 anos",
    cases: "280+",
    rating: "⭐ 4.7",
    availability: "48h",
    color: "#7a3a0a",
    gradient: "linear-gradient(135deg, #3a1a00, #7a3a0a)"
  }
];

export function Lawyers() {
  const [activeFilter, setActiveFilter] = useState("Todos");

  const filters = [
    "Todos",
    "Violência Doméstica",
    "Direito de Família",
    "Medida Protetiva",
    "Direito Penal"
  ];

  const filteredLawyers = activeFilter === "Todos"
    ? lawyersData
    : lawyersData.filter(lawyer => 
        lawyer.specialties.some(spec => 
          spec.toLowerCase().includes(activeFilter.toLowerCase()) || 
          activeFilter.toLowerCase().includes(spec.toLowerCase())
        )
      );

  return (
    <div className="page active" id="page-lawyers">
      <section style={{ background: "linear-gradient(135deg, var(--wine3), var(--wine))", color: "#fff", padding: "60px 24px" }}>
        <div className="section-inner" style={{ marginBottom: 0 }}>
          <div className="section-tag" style={{ background: "rgba(255, 255, 255, 0.15)", color: "#fff" }}>Nossa rede</div>
          <h2 className="section-title" style={{ color: "#fff" }}>Advogados Voluntários Parceiros</h2>
          <p className="section-sub" style={{ color: "rgba(255, 255, 255, 0.8)", marginBottom: 0 }}>
            Profissionais com OAB ativa, verificados e comprometidos com o acesso à justiça para todas as mulheres.
          </p>
        </div>
      </section>

      <section>
        <div className="section-inner">
          {/* Filters Bar */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "32px" }}>
            {filters.map(filter => (
              <button
                key={filter}
                className={`faq-cat ${activeFilter === filter ? "active" : ""}`}
                onClick={() => setActiveFilter(filter)}
                style={{ outline: "none" }}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Lawyers Grid */}
          <div className="lawyers-grid">
            {filteredLawyers.map(lawyer => (
              <div className="lawyer-card" key={lawyer.id}>
                <div className="lawyer-top" style={{ background: lawyer.gradient }}>
                  <div className="lawyer-avatar" style={{ background: "rgba(255, 255, 255, 0.15)" }}>
                    {lawyer.avatar}
                  </div>
                  <div className="lawyer-top-info">
                    <h3>{lawyer.name}</h3>
                    <span>{lawyer.oab}</span>
                  </div>
                </div>
                <div className="lawyer-body">
                  <div className="volunteer-seal">
                    <i className="fas fa-award"></i> {lawyer.seal}
                  </div>
                  <div className="lawyer-tags">
                    {lawyer.specialties.map((spec, i) => (
                      <span key={i} className={`tag ${i === 0 ? "tag-wine" : "tag-green"}`}>
                        {spec}
                      </span>
                    ))}
                  </div>
                  <div className="lawyer-meta">
                    <div className="lawyer-meta-item"><span>Experiência</span><strong>{lawyer.experience}</strong></div>
                    <div className="lawyer-meta-item"><span>Casos atendidos</span><strong>{lawyer.cases}</strong></div>
                    <div className="lawyer-meta-item"><span>Avaliação</span><strong>{lawyer.rating}</strong></div>
                    <div className="lawyer-meta-item"><span>Disponibilidade</span><strong>{lawyer.availability}</strong></div>
                  </div>
                  <Link to="/chat" className="btn btn-wine" style={{ width: "100%", justifyContent: "center", background: lawyer.color }}>
                    <i className="fas fa-comment-dots"></i> Entrar em contato
                  </Link>
                </div>
              </div>
            ))}
            {filteredLawyers.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "var(--mid)" }}>
                Nenhum advogado encontrado para esta especialidade nesta região de demonstração.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
