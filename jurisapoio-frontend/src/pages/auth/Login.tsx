import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

export function Login() {

  const { login } = useAuth();

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function handleSubmit(
    event: React.FormEvent
  ) {

    event.preventDefault();

    try {

      await login({
        email,
        senha,
      });

      navigate("/dashboard");

    } catch {

      alert("Email ou senha inválidos");
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >

        <h1 className="text-3xl font-bold text-wine mb-6">
          Entrar
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full border p-3 rounded mb-4"
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) =>
            setSenha(e.target.value)
          }
          className="w-full border p-3 rounded mb-4"
        />

        <button
          type="submit"
          className="w-full bg-wine text-white p-3 rounded"
        >
          Entrar
        </button>

      </form>

    </div>
  );
}
  async function login(data: LoginData) {

    const response =
      await authService.login(data);

    const {
      accessToken,
      refreshToken,
    } = response.data;

    tokenStorage.setTokens(
      accessToken,
      refreshToken
    );

    setIsAuthenticated(true);

    return response.data;
  }