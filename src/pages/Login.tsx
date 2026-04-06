import { useState } from "react";
import { useAppStore } from "@/store/appStore";

const Login = () => {
  const login = useAppStore(state => state.login);
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      login(email);
    }
  };

  return (
    <div className="animate-fade-in" style={{
      display: "flex",
      minHeight: "100vh",
      backgroundColor: "var(--neutral-l02)",
      backgroundImage: "radial-gradient(circle at 10% 20%, rgba(0, 199, 61, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(0, 154, 47, 0.05) 0%, transparent 40%)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      alignItems: "center",
      justifyContent: "center",
      padding: "var(--space-4)"
    }}>
      <div className="card" style={{ width: "100%", maxWidth: 420, padding: "var(--space-6)", boxShadow: "var(--shadow-lg)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "linear-gradient(90deg, var(--brand-primary), var(--success-dark))" }} />
        
        <div style={{ textAlign: "center", marginBottom: "var(--space-6)", marginTop: "var(--space-2)" }}>
          <h1 style={{ fontSize: "28px", color: "var(--text-primary)", marginBottom: "var(--space-2)" }}>
            <span style={{ color: "var(--brand-primary)" }}>UX</span>Recruit
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--fs-label)" }}>Gestión de ResearchOps</p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div className="input-field">
            <label className="input-field__label">Correo corporativo</label>
            <input
              type="email"
              className="input-field__input"
              placeholder="usuario@skandia.com.co"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ padding: "12px 16px" }}
            />
          </div>
          
          <button type="submit" className="btn btn--primary" style={{ width: "100%", justifyContent: "center", padding: "12px", marginTop: "var(--space-2)", fontSize: "var(--fs-body)" }}>
            Iniciar sesión <i className="fa-solid fa-arrow-right" style={{ marginLeft: "var(--space-2)" }} />
          </button>
        </form>
        
        <div style={{ marginTop: "var(--space-6)", textAlign: "center", fontSize: "11px", color: "var(--text-medium)" }}>
          Uso exclusivo para el equipo de Diseño y CX de Skandia
        </div>
      </div>
    </div>
  );
};

export default Login;
