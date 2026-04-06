import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import ImportBonosModal from "@/components/bonos/ImportBonosModal";
import { safeFormatDate, toDate } from "@/utils/dateUtils";

const Bonos = () => {
  const bonos = useAppStore(state => state.bonos);
  const importarBonosJuju = useAppStore(state => state.importarBonosJuju);
  const [showImport, setShowImport] = useState(false);
  const disponibles = bonos.filter(b => b.estado === "Disponible").length;
  const enviados = bonos.filter(b => b.estado === "Enviado").length;
  const vencidos = bonos.filter(b => b.estado === "Vencido").length;

  const in15days = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
  const proximosVencer = bonos.filter(b => {
    const vDate = toDate(b.fechaVencimiento);
    return b.estado === "Disponible" && vDate && vDate <= in15days;
  }).length;

  const isExpiringSoon = (b: typeof bonos[0]) => {
    const vDate = toDate(b.fechaVencimiento);
    return b.estado === "Disponible" && vDate && vDate <= in15days;
  };

  const estadoBadge = (estado: string) => {
    switch (estado) {
      case "Disponible": return "badge--success";
      case "Enviado": return "badge--neutral";
      case "Vencido": return "badge--error";
      default: return "badge--neutral";
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header__left">
          <h1>Bonos</h1>
        </div>
        <div className="page-header__right">
          <button className="btn btn--secondary" onClick={() => setShowImport(true)}>
            <i className="fa-solid fa-file-arrow-up" aria-hidden="true" /> Importar Excel de Juju
          </button>
        </div>
      </div>

      <div className="kpi-row" style={{ marginBottom: "var(--space-4)" }}>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="kpi-card__label">Disponibles</div>
          <div className="kpi-card__value" style={{ fontSize: "var(--fs-h2)" }}>{disponibles}</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="kpi-card__label">Enviados</div>
          <div className="kpi-card__value" style={{ fontSize: "var(--fs-h2)" }}>{enviados}</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="kpi-card__label">Vencidos</div>
          <div className="kpi-card__value" style={{ fontSize: "var(--fs-h2)" }}>{vencidos}</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="kpi-card__label">Próximos a vencer (15d)</div>
          <div className="kpi-card__value" style={{ fontSize: "var(--fs-h2)" }}>{proximosVencer}</div>
        </div>
      </div>

      {disponibles <= 10 && (
        <div className="info-banner info-banner--warning" style={{ marginBottom: "var(--space-4)" }}>
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
          Quedan pocos códigos disponibles. Solicita un nuevo lote a Juju.
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>GUID</th>
              <th>Código</th>
              <th>Puntos</th>
              <th>Estado</th>
              <th>Vencimiento</th>
              <th>Investigación</th>
              <th>Participante</th>
              <th>Fecha envío</th>
            </tr>
          </thead>
          <tbody>
            {bonos.map(b => (
              <tr key={b.guid} className={isExpiringSoon(b) ? "row--warning" : ""}>
                <td style={{ fontFamily: "monospace", fontSize: "var(--fs-caption)" }}>{b.guid}</td>
                <td style={{ fontWeight: "var(--fw-medium)" as any }}>{b.codigo}</td>
                <td>{b.puntos}</td>
                <td><span className={`badge ${estadoBadge(b.estado)}`}>{b.estado}</span></td>
                <td>{safeFormatDate(b.fechaVencimiento)}</td>
                <td>{b.investigacion || <span className="text-null">—</span>}</td>
                <td>{b.participanteNombre || <span className="text-null">—</span>}</td>
                <td>{safeFormatDate(b.fechaEnvio)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showImport && (
        <div className="overlay overlay--visible">
          <ImportBonosModal
            existingGuids={bonos.map(b => b.guid)}
            onImport={(nuevos) => {
              importarBonosJuju(nuevos);
              setShowImport(false);
            }}
            onClose={() => setShowImport(false)}
          />
        </div>
      )}
    </div>
  );
};

export default Bonos;
