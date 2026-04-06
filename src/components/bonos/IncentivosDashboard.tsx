import { useAppStore } from "@/store/appStore";
import { toDate } from "@/utils/dateUtils";

const IncentivosDashboard = () => {
  const { bonos } = useAppStore();
  
  const total = bonos.length;
  const disponibles = bonos.filter(b => b.estado === "Disponible").length;
  const porcentage = total > 0 ? (disponibles / total) * 100 : 0;
  
  // Próximos a vencer (menos de 30 días)
  const ahora = new Date();
  const proximosVencimiento = bonos.filter(b => {
    if (b.estado !== "Disponible") return false;
    const vence = toDate(b.fechaVencimiento);
    if (!vence) return false;
    const diff = (vence.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24);
    return diff < 30;
  }).length;

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "var(--fs-label)", margin: 0 }}>Stock de Incentivos</h3>
        <span className="badge badge--neutral" style={{ fontSize: 10 }}>Total: {total}</span>
      </div>
      
      <div style={{ position: "relative", padding: "var(--space-2) 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-1)", fontSize: "var(--fs-caption)" }}>
          <span style={{ color: "var(--text-secondary)" }}>Bonos Disponibles</span>
          <span style={{ fontWeight: "var(--fw-bold)" as any, color: "var(--success-dark)" }}>{disponibles}</span>
        </div>
        <div className="progress-bar" style={{ height: 8 }}>
          <div 
            className="progress-bar__fill" 
            style={{ 
              width: `${porcentage}%`, 
              background: porcentage < 20 ? "var(--error-dark)" : porcentage < 50 ? "var(--warning-dark)" : "var(--pg-00)" 
            }} 
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)", marginTop: "var(--space-1)" }}>
        <div style={{ background: "var(--neutral-l02)", padding: "var(--space-2)", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
          <div style={{ fontSize: "var(--fs-title-h3)", fontWeight: "var(--fw-bold)" as any, color: "var(--text-primary)" }}>{disponibles}</div>
          <div style={{ fontSize: "10px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Disponibles</div>
        </div>
        <div style={{ background: proximosVencimiento > 0 ? "var(--warning-light)" : "var(--neutral-l02)", padding: "var(--space-2)", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
          <div style={{ fontSize: "var(--fs-title-h3)", fontWeight: "var(--fw-bold)" as any, color: proximosVencimiento > 0 ? "var(--warning-dark)" : "var(--text-primary)" }}>{proximosVencimiento}</div>
          <div style={{ fontSize: "10px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Por vencer</div>
        </div>
      </div>
    </div>
  );
};

export default IncentivosDashboard;
