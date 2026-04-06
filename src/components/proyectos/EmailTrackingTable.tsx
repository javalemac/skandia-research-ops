import { useState } from "react";
import type { EmailTracking } from "@/types";
import { safeFormatDateTime, safeCompareDates } from "@/utils/dateUtils";

interface Props {
  emails: EmailTracking[];
}

const estadoBadge = (estado: EmailTracking["estado"]) => {
  switch (estado) {
    case "Abierto": return "badge--success badge--animate";
    case "Entregado": return "badge--info";
    case "Enviado": return "badge--neutral badge--pulse";
    case "Pendiente": return "badge--warning badge--pulse";
    case "Fallido": return "badge--error";
  }
};

const estadoIcon = (estado: EmailTracking["estado"]) => {
  switch (estado) {
    case "Abierto": return "fa-solid fa-envelope-open";
    case "Entregado": return "fa-solid fa-check";
    case "Enviado": return "fa-solid fa-paper-plane";
    case "Pendiente": return "fa-solid fa-clock";
    case "Fallido": return "fa-solid fa-triangle-exclamation";
  }
};

const EmailTrackingTable = ({ emails }: Props) => {
  const [filterEstado, setFilterEstado] = useState<string>("Todos");

  const estados: EmailTracking["estado"][] = ["Enviado", "Entregado", "Abierto", "Pendiente", "Fallido"];
  const filtered = filterEstado === "Todos" ? emails : emails.filter(e => e.estado === filterEstado);


  // KPIs
  const total = emails.length;
  const abiertos = emails.filter(e => e.estado === "Abierto").length;
  const entregados = emails.filter(e => e.estado === "Entregado").length;
  const fallidos = emails.filter(e => e.estado === "Fallido").length;
  const tasaApertura = total > 0 ? Math.round((abiertos / total) * 100) : 0;

  if (emails.length === 0) {
    return (
      <div className="empty-state">
        <i className="fa-solid fa-paper-plane" aria-hidden="true" />
        <p>No se han enviado correos en este proyecto</p>
        <button className="btn btn--secondary">
          <i className="fa-solid fa-envelope" aria-hidden="true" /> Enviar primera invitación
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
        <div className="card" style={{ padding: "var(--space-3)" }}>
          <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)", marginBottom: "var(--space-1)" }}>Total enviados</div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "var(--fs-h3)", fontWeight: "var(--fw-bold)" as any }}>{total}</div>
        </div>
        <div className="card" style={{ padding: "var(--space-3)" }}>
          <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)", marginBottom: "var(--space-1)" }}>Tasa de apertura</div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "var(--fs-h3)", fontWeight: "var(--fw-bold)" as any, color: "var(--text-brand)" }}>{tasaApertura}%</div>
        </div>
        <div className="card" style={{ padding: "var(--space-3)" }}>
          <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)", marginBottom: "var(--space-1)" }}>Entregados</div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "var(--fs-h3)", fontWeight: "var(--fw-bold)" as any }}>{entregados}</div>
        </div>
        <div className="card" style={{ padding: "var(--space-3)" }}>
          <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)", marginBottom: "var(--space-1)" }}>Fallidos</div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "var(--fs-h3)", fontWeight: "var(--fw-bold)" as any, color: fallidos > 0 ? "var(--error-dark)" : undefined }}>{fallidos}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-3)", flexWrap: "wrap" }}>
        <button
          className={`chip ${filterEstado === "Todos" ? "chip--active" : ""}`}
          onClick={() => setFilterEstado("Todos")}
        >
          Todos ({total})
        </button>
        {estados.map(e => {
          const count = emails.filter(em => em.estado === e).length;
          if (count === 0) return null;
          return (
            <button
              key={e}
              className={`chip ${filterEstado === e ? "chip--active" : ""}`}
              onClick={() => setFilterEstado(e)}
            >
              {e} ({count})
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Participante</th>
              <th>Plantilla</th>
              <th>Estado</th>
              <th>Fecha de envío</th>
              <th>Apertura</th>
              <th>Enviado por</th>
            </tr>
          </thead>
          <tbody>
            {filtered.sort((a, b) => safeCompareDates(a.fechaEnvio, b.fechaEnvio)).map(email => (
              <tr key={email.id}>
                <td>
                  <div className="data-table__name">
                    <div className="data-table__name-text">
                      <span className="data-table__name-primary" style={{ cursor: "default" }}>{email.participanteNombre}</span>
                      <span className="data-table__name-secondary">{email.participanteCorreo}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div>
                    <span style={{ fontSize: "var(--fs-label)" }}>{email.plantillaNombre}</span>
                    <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-medium)" }}>{email.plantillaCodigo}</div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${estadoBadge(email.estado)}`}>
                    <i className={estadoIcon(email.estado)} aria-hidden="true" />
                    {email.estado}
                  </span>
                </td>
                <td style={{ fontSize: "var(--fs-caption)" }}>{safeFormatDateTime(email.fechaEnvio)}</td>
                <td style={{ fontSize: "var(--fs-caption)" }}>
                  {email.fechaApertura ? safeFormatDateTime(email.fechaApertura) : <span className="text-null">—</span>}
                </td>
                <td style={{ fontSize: "var(--fs-caption)" }}>{email.enviadoPor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmailTrackingTable;
