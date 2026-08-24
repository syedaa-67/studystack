import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const form = new URLSearchParams();
      form.append("username", email);
      form.append("password", password);

      const res = await api.post("/auth/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      localStorage.setItem("token", res.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-10 w-full max-w-md flex flex-col gap-4"
      >
        <h1 className="text-3xl font-bold mb-2 text-slate-100">
          Welcome to <span className="text-yellow-400">StudyStack</span>
        </h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-yellow-400/50 text-slate-100 placeholder:text-slate-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-yellow-400/50 text-slate-100 placeholder:text-slate-500"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          className="bg-yellow-400 text-slate-900 font-semibold rounded-lg py-3 mt-2 hover:bg-yellow-300 transition cursor-pointer"
        >
          Log In
        </button>
      </form>
    </div>
  );
}
