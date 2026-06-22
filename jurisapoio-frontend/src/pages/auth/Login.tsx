import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import { authService } from "../../services/authService";
import { advogadoService } from "../../services/advogadoService";

type UserRole = "vitima" | "advogado";

export function Login() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  // Role selection: vitima or advogado
  const [role, setRole] = useState<UserRole>("vitima");
  const [isRegistering, setIsRegistering] = useState(false);

  // Common/Victim Login fields
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // Victim Register fields
  const [nome, setNome] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regSenha, setRegSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");


  const [advNome, setAdvNome] = useState("");
  const [advOab, setAdvOab] = useState("");
  const [advUf, setAdvUf] = useState("SP");
  const [advEspecialidade, setAdvEspecialidade] = useState("Violência Doméstica");
  const [advSenha, setAdvSenha] = useState("");

  // Form submitting/loading states
  const [isVerifyingOab, setIsVerifyingOab] = useState(false);

  async function handleLoginSubmit(event: React.FormEvent) {
    event.preventDefault();

    // Check admin credentials
    if (email === "admin@jurisapoio.com" && senha === "admin123") {
      try {
        await login({ email, senha }, "admin");
        navigate("/dashboard-admin");
        return;
      } catch {
        alert("Erro ao logar como administrador");
        return;
      }
    }

    try {
      if (role === "vitima") {
        await login({
          email,
          senha,
        }, "vitima");
        navigate("/dashboard");
      } else {
        // Log in to retrieve JWT first
        await login({ email, senha }, "advogado");

        try {
          // Verify status on the backend
          const profileRes = await advogadoService.obterPerfil();
          const { statusAprovacao } = profileRes.data;

          if (statusAprovacao === "PENDENTE") {
            alert("Seu cadastro está sob análise. Aguarde a homologação do administrador.");
            logout();
            return;
          }
          if (statusAprovacao === "RECUSADO") {
            alert("Seu cadastro foi recusado ou suspenso pelo administrador.");
            logout();
            return;
          }

          localStorage.setItem("logged_lawyer_email", email);
          navigate("/dashboard-advogado");
        } catch (profileError) {
          // If we logged in but profile fetch failed (shouldn't normally happen if backend is up)
          console.error("Erro ao obter perfil do advogado voluntário:", profileError);
          // Standard redirect as fallback
          localStorage.setItem("logged_lawyer_email", email);
          navigate("/dashboard-advogado");
        }
      }
    } catch (loginError: any) {
      if (loginError && loginError.response) {
        alert("E-mail ou senha inválidos.");
        return;
      }

      // Backend auth failed (offline/network). Fallback to localStorage simulation
      console.warn("Autenticação com o backend falhou. Tentando simulação local...", loginError);

      if (role === "vitima") {
        // Simulate local login
        await login({ email, senha }, "vitima");
        navigate("/dashboard");
      } else {
        // Validate lawyer credentials and approval status in localStorage simulation
        const lawyersData = localStorage.getItem("juris_lawyers");
        if (lawyersData) {
          const lawyersList = JSON.parse(lawyersData);
          const foundLawyer = lawyersList.find((l: any) => l.email === email);

          if (foundLawyer) {
            if (foundLawyer.senha !== senha) {
              alert("Senha incorreta!");
              return;
            }
            if (foundLawyer.status === "pending") {
              alert("Seu cadastro está sob análise. Aguarde a homologação do administrador.");
              return;
            }
            if (foundLawyer.status === "rejected") {
              alert("Seu cadastro foi recusado ou suspenso pelo administrador.");
              return;
            }

            localStorage.setItem("logged_lawyer_email", email);
            await login({ email, senha }, "advogado");
            navigate("/dashboard-advogado");
            return;
          }
        }

        // Simulação genérica
        await login({ email, senha }, "advogado");
        alert("Login de Advogado simulado com sucesso! Redirecionando para o Painel de Atendimento.");
        navigate("/dashboard-advogado");
      }
    }
  }

  async function handleVictimRegister(event: React.FormEvent) {
    event.preventDefault();
    if (!nome.trim() || !regEmail.trim() || !regSenha.trim()) {
      alert("Por favor, preencha todos os campos.");
      return;
    }
    if (regSenha !== confirmSenha) {
      alert("As senhas não coincidem!");
      return;
    }

    try {
      // Call backend API
      await authService.cadastrarVitima({
        email: regEmail,
        senha: regSenha,
        nomeAnonimo: nome,
        estadoResidencia: "MG", // Default value
        aceitouTermos: true
      });
      alert("Cadastro de Usuário realizado com sucesso! Realizando login automático...");
      await login({ email: regEmail, senha: regSenha }, "vitima");
      navigate("/dashboard");
    } catch (error: any) {
      if (error && error.response) {
        const backendMessage = error.response.data?.mensagem || "Erro ao cadastrar usuário no servidor.";
        alert(`Erro no cadastro: ${backendMessage}`);
        return;
      }
      console.warn("Erro no cadastro pelo backend. Usando fallback simulado...", error);
      alert("Cadastro de Usuário realizado com sucesso! Você já pode entrar.");
      setEmail(regEmail);
      setIsRegistering(false);
    }
  }

  async function handleLawyerRegister(event: React.FormEvent) {
    event.preventDefault();
    if (!advNome.trim() || !advOab.trim() || !advEmail.trim() || !advSenha.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setIsVerifyingOab(true);

    try {
      // Call backend API
      await authService.cadastrarAdvogado({
        email: advEmail,
        senha: advSenha,
        nome: advNome,
        numeroOAB: `${advOab}/${advUf}`,
        especialidades: advEspecialidade
      });

      alert("Cadastro realizado com sucesso! Sua solicitação foi enviada ao administrador do sistema.");
      setEmail(advEmail);
      setIsRegistering(false);
      setIsVerifyingOab(false);
    } catch (error: any) {
      if (error && error.response) {
        const backendMessage = error.response.data?.mensagem || "Erro ao cadastrar advogado no servidor.";
        alert(`Erro no cadastro: ${backendMessage}`);
        setIsVerifyingOab(false);
        return;
      }
      console.warn("Erro no cadastro de advogado pelo backend. Usando fallback simulado...", error);

      const existingLawyersStr = localStorage.getItem("juris_lawyers");
      const existingLawyers = existingLawyersStr ? JSON.parse(existingLawyersStr) : [];

      if (existingLawyers.some((l: any) => l.email === advEmail)) {
        alert("Este e-mail profissional já está cadastrado!");
        setIsVerifyingOab(false);
        return;
      }

      const newLawyer = {
        id: existingLawyers.length + 1,
        name: advNome,
        email: advEmail,
        senha: advSenha,
        oab: advOab,
        uf: advUf,
        specialties: [advEspecialidade],
        seal: "Aguardando Verificação",
        experience: "Iniciante",
        cases: "0",
        rating: "⭐ 5.0",
        availability: "48h",
        color: "var(--wine)",
        gradient: "linear-gradient(135deg, var(--wine3), var(--wine))",
        status: "pending"
      };

      existingLawyers.push(newLawyer);
      localStorage.setItem("juris_lawyers", JSON.stringify(existingLawyers));

      alert("Cadastro realizado com sucesso! Sua solicitação foi enviada ao administrador do sistema.");

      setEmail(advEmail);
      setIsRegistering(false);
      setIsVerifyingOab(false);
    }
  }

  // Helper local email state for lawyer register
  const [advEmail, setAdvEmail] = useState("");

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4">
      {/* Back to Home Link */}
      <Link
        to="/"
        className="mb-4 text-wine hover:text-wine2 font-medium flex items-center gap-2 transition text-sm decoration-transparent"
        style={{ textDecoration: "none", color: "var(--wine)" }}
      >
        <i className="fas fa-arrow-left"></i> Voltar para o Início
      </Link>

      <div className="bg-white rounded-lg shadow-md w-full max-w-md overflow-hidden" style={{ boxShadow: "var(--shadow)" }}>
        {/* Role Tabs Selection */}
        {!isRegistering && (
          <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
            <button
              onClick={() => setRole("vitima")}
              style={{
                flex: 1,
                padding: "14px",
                border: "none",
                background: role === "vitima" ? "var(--white)" : "var(--warm)",
                color: role === "vitima" ? "var(--wine)" : "var(--soft)",
                fontWeight: role === "vitima" ? "bold" : "normal",
                borderBottom: role === "vitima" ? "2.5px solid var(--wine)" : "none",
                cursor: "pointer",
                fontFamily: "inherit"
              }}
            >
              <i className="fas fa-user-shield"></i>
            </button>
            <button
              onClick={() => setRole("advogado")}
              style={{
                flex: 1,
                padding: "14px",
                border: "none",
                background: role === "advogado" ? "var(--white)" : "var(--warm)",
                color: role === "advogado" ? "var(--wine)" : "var(--soft)",
                fontWeight: role === "advogado" ? "bold" : "normal",
                borderBottom: role === "advogado" ? "2.5px solid var(--wine)" : "none",
                cursor: "pointer",
                fontFamily: "inherit"
              }}
            >
              <i className="fas fa-user-tie"></i>
            </button>
          </div>
        )}

        <div className="p-8">
          {isRegistering ? (
            role === "vitima" ? (
              // VICTIM REGISTER FORM
              <form onSubmit={handleVictimRegister}>
                <h1 className="text-3xl font-bold text-wine mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
                  Criar Conta
                </h1>
                <p className="text-sm text-mid mb-6" style={{ color: "var(--mid)" }}>Cadastre-se de forma segura e 100% anônima.</p>

                <div className="mb-4">
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--slate)" }}>Apelido ou Nome</label>
                  <input
                    type="text"
                    placeholder="Ex: Maria"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full border p-3 rounded-lg outline-none focus:border-rose transition"
                    style={{ borderColor: "var(--border)" }}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--slate)" }}>E-mail</label>
                  <input
                    type="email"
                    placeholder="maria@exemplo.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full border p-3 rounded-lg outline-none focus:border-rose transition"
                    style={{ borderColor: "var(--border)" }}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--slate)" }}>Senha</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={regSenha}
                    onChange={(e) => setRegSenha(e.target.value)}
                    className="w-full border p-3 rounded-lg outline-none focus:border-rose transition"
                    style={{ borderColor: "var(--border)" }}
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--slate)" }}>Confirmar Senha</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmSenha}
                    onChange={(e) => setConfirmSenha(e.target.value)}
                    className="w-full border p-3 rounded-lg outline-none focus:border-rose transition"
                    style={{ borderColor: "var(--border)" }}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-wine hover:bg-wine2 text-white p-3 rounded-lg transition font-medium"
                  style={{ backgroundColor: "var(--wine)", color: "#fff", border: "none", cursor: "pointer" }}
                >
                  Cadastrar
                </button>

                <p className="text-center text-sm mt-4" style={{ color: "var(--mid)" }}>
                  Já tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="text-wine font-semibold hover:underline"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "var(--wine)" }}
                  >
                    Entrar
                  </button>
                </p>
              </form>
            ) : (
              // LAWYER REGISTER FORM WITH OAB VALIDATION
              <form onSubmit={handleLawyerRegister}>
                <h1 className="text-3xl font-bold text-wine mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
                  Criar Conta (Advogado)
                </h1>
                <p className="text-sm text-mid mb-6" style={{ color: "var(--mid)" }}>Cadastre-se para prestar apoio voluntário na plataforma.</p>

                <div className="mb-4">
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--slate)" }}>Nome Completo</label>
                  <input
                    type="text"
                    placeholder="Dr(a). Nome Completo"
                    value={advNome}
                    onChange={(e) => setAdvNome(e.target.value)}
                    className="w-full border p-3 rounded-lg outline-none focus:border-rose transition"
                    style={{ borderColor: "var(--border)" }}
                    required
                    disabled={isVerifyingOab}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--slate)" }}>E-mail profissional</label>
                  <input
                    type="email"
                    placeholder="oab@exemplo.com"
                    value={advEmail}
                    onChange={(e) => setAdvEmail(e.target.value)}
                    className="w-full border p-3 rounded-lg outline-none focus:border-rose transition"
                    style={{ borderColor: "var(--border)" }}
                    required
                    disabled={isVerifyingOab}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", marginBottom: "4px" }}>
                  <div style={{ flex: 2 }}>
                    <label className="block text-xs font-semibold mb-1" style={{ color: "var(--slate)" }}>Nº da OAB</label>
                    <input
                      type="text"
                      placeholder="Ex: 187432"
                      value={advOab}
                      onChange={(e) => setAdvOab(e.target.value)}
                      className="w-full border p-3 rounded-lg outline-none focus:border-rose transition"
                      style={{ borderColor: "var(--border)" }}
                      required
                      disabled={isVerifyingOab}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="block text-xs font-semibold mb-1" style={{ color: "var(--slate)" }}>Seccional (UF)</label>
                    <select
                      value={advUf}
                      onChange={(e) => setAdvUf(e.target.value)}
                      className="w-full border p-3 rounded-lg outline-none focus:border-rose transition"
                      style={{ borderColor: "var(--border)", height: "46px" }}
                      disabled={isVerifyingOab}
                    >
                      {["SP", "RJ", "MG", "DF", "BA", "RS", "PR", "SC", "PE", "CE"].map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--slate)" }}>Especialidade Principal</label>
                  <select
                    value={advEspecialidade}
                    onChange={(e) => setAdvEspecialidade(e.target.value)}
                    className="w-full border p-3 rounded-lg outline-none focus:border-rose transition"
                    style={{ borderColor: "var(--border)", height: "46px" }}
                    disabled={isVerifyingOab}
                  >
                    <option value="Violência Doméstica">Violência Doméstica (Lei Maria da Penha)</option>
                    <option value="Direito de Família">Direito de Família (Divórcio/Guarda)</option>
                    <option value="Direito Penal">Direito Penal Geral</option>
                    <option value="Direitos Humanos">Direitos Humanos</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--slate)" }}>Senha</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={advSenha}
                    onChange={(e) => setAdvSenha(e.target.value)}
                    className="w-full border p-3 rounded-lg outline-none focus:border-rose transition"
                    style={{ borderColor: "var(--border)" }}
                    required
                    disabled={isVerifyingOab}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-wine hover:bg-wine2 text-white p-3 rounded-lg transition font-medium"
                  style={{ backgroundColor: "var(--wine)", color: "#fff", border: "none", cursor: "pointer" }}
                  disabled={isVerifyingOab}
                >
                  {isVerifyingOab ? "Cadastrando..." : "Cadastrar"}
                </button>

                <p className="text-center text-sm mt-4" style={{ color: "var(--mid)" }}>
                  Já tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="text-wine font-semibold hover:underline"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "var(--wine)" }}
                    disabled={isVerifyingOab}
                  >
                    Entrar
                  </button>
                </p>
              </form>
            )
          ) : (
            // LOGIN FORM (SHARED CARD WITH TABS)
            <form onSubmit={handleLoginSubmit}>
              <h1 className="text-3xl font-bold text-wine mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
                Entrar
              </h1>
              <p className="text-sm text-mid mb-6" style={{ color: "var(--mid)" }}>
                {role === "vitima"
                  ? "Acesse sua área restrita segura de forma anônima."
                  : "Acesse o painel de atendimentos voluntários."
                }
              </p>

              <div className="mb-4">
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--slate)" }}>E-mail</label>
                <input
                  type="email"
                  placeholder="exemplo@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border p-3 rounded-lg outline-none focus:border-rose transition"
                  style={{ borderColor: "var(--border)" }}
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--slate)" }}>Senha</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full border p-3 rounded-lg outline-none focus:border-rose transition"
                  style={{ borderColor: "var(--border)" }}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-wine hover:bg-wine2 text-white p-3 rounded-lg transition font-medium"
                style={{ backgroundColor: "var(--wine)", color: "#fff", border: "none", cursor: "pointer" }}
              >
                Entrar
              </button>

              <p className="text-center text-sm mt-4" style={{ color: "var(--mid)" }}>
                Não tem uma conta?{" "}
                <button
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className="text-wine font-semibold hover:underline"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "var(--wine)" }}
                >
                  Cadastre-se
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}