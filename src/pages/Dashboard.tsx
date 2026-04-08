import { useAppStore } from "@/store/appStore";
import { useIsMobile } from "@/hooks/use-mobile";
import IncentivosDashboard from "@/components/bonos/IncentivosDashboard";

const Dashboard = () => {
  const isMobile = useIsMobile();
  const { participantes, bonos, actividadReciente, isLoading } = useAppStore();

  if (isLoading) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ marginBottom: 'var(--space-4)' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Sincronizando con Supabase...</p>
        </div>
      </div>
    );
  }
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

      <div className="dashboard-grid">
        <div className="card" style={{ padding: "var(--space-4)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
            <h3 style={{ margin: 0 }}>Actividad reciente</h3>
            <span style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)" }}>Últimas 24 horas</span>
          </div>
          {isMobile ? (
            <div className="mobile-list" style={{ gap: 'var(--space-2)' }}>
              {actividadReciente.slice(0, 6).map((a, i) => (
                <div key={i} style={{ 
                  padding: 'var(--space-3) 0', 
                  borderBottom: "1px solid var(--neutral-l02)",
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: "var(--fs-label)", fontWeight: "var(--fw-medium)" }}>{a.accion}</div>
                    <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)" }}>{a.participante}</div>
                  </div>
                  <div style={{ textAlign: "right", color: "var(--text-secondary)", fontSize: "var(--fs-caption)" }}>
                    {a.tiempo}
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
          )}
        </div>

        <IncentivosDashboard />
      </div>
    </div>
  );
};

export default Dashboard;
