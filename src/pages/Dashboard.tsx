import { useAppStore } from "@/store/appStore";
import IncentivosDashboard from "@/components/bonos/IncentivosDashboard";

const Dashboard = () => {
  const { participantes, bonos, actividadReciente } = useAppStore();
  const totalParticipantes = participantes.length;
  const disponibles = participantes.filter(p => p.disponibilidad === "Disponible").length;
  const bonosDisponibles = bonos.filter(b => b.estado === "Disponible").length;
  const enEnfriamiento = participantes.filter(p => p.disponibilidad === "En enfriamiento").length;

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: "var(--space-5)" }}>Dashboard</h1>
      <div className="kpi-row">
        <div className="card">
          <div className="kpi-card__label">Participantes totales</div>
          <div className="kpi-card__value">{totalParticipantes}</div>
          <div className="kpi-card__delta">+2 este mes ↑</div>
        </div>
        <div className="card">
          <div className="kpi-card__label">Disponibles ahora</div>
          <div className="kpi-card__value">{disponibles}</div>
        </div>
        <div className="card">
          <div className="kpi-card__label">Bonos disponibles</div>
          <div className="kpi-card__value">{bonosDisponibles}</div>
          {bonosDisponibles <= 10 && (
            <div style={{ fontSize: "var(--fs-caption)", color: "var(--warning-dark)", marginTop: "var(--space-1)" }}>
              <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" /> Quedan pocos
            </div>
          )}
        </div>
        <div className="card">
          <div className="kpi-card__label">En enfriamiento</div>
          <div className="kpi-card__value">{enEnfriamiento}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "var(--space-4)", marginTop: "var(--space-4)" }}>
        <div className="card" style={{ padding: "var(--space-4)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
            <h3 style={{ margin: 0 }}>Actividad reciente</h3>
            <span style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)" }}>Últimas 24 horas</span>
          </div>
          <table className="data-table">
            <thead style={{ background: "transparent" }}>
              <tr>
                <th style={{ paddingLeft: 0 }}>Acción</th>
                <th>Participante</th>
                <th style={{ paddingRight: 0, textAlign: "right" }}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {actividadReciente.slice(0, 6).map((a, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--neutral-l02)" }}>
                  <td style={{ paddingLeft: 0, fontSize: "var(--fs-label)", fontWeight: "var(--fw-medium)" }}>
                    {a.accion}
                  </td>
                  <td style={{ fontSize: "var(--fs-label)" }}>{a.participante}</td>
                  <td style={{ paddingRight: 0, textAlign: "right", color: "var(--text-secondary)", fontSize: "var(--fs-caption)" }}>
                    {a.tiempo}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <IncentivosDashboard />
      </div>
    </div>
  );
};

export default Dashboard;
