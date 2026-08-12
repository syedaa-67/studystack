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
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl2 p-10 w-full max-w-md flex flex-col gap-4"
      >
        <h1 className="text-3xl font-bold mb-2 text-dark">
          Welcome to <span className="text-brand bg-dark px-2 rounded-md">StudyStack</span>
        </h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded-full px-4 py-3 outline-none focus:border-brand text-dark"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded-full px-4 py-3 outline-none focus:border-brand text-dark"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="bg-brand text-dark font-semibold rounded-full py-3 mt-2 hover:opacity-90 cursor-pointer"
        >
          Log In
        </button>
      </form>
    </div>
  );
}
