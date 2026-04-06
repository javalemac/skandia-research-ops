import type { Participante } from "@/types";
import { useAppStore } from "@/store/appStore";

interface Props {
  participant: Participante;
  onBack: () => void;
  onEdit?: (p: Participante) => void;
  onAddToProject?: (p: Participante) => void;
  onSendEmail?: (p: Participante) => void;
}

const ParticipantProfile = ({ participant: initialParticipant, onBack, onEdit, onAddToProject, onSendEmail }: Props) => {
  const store = useAppStore();
  const p = store.participantes.find(x => x.id === initialParticipant.id) || initialParticipant;
  const getInitials = (name: string) => name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
  const pct = Math.min((p.puntosAcumulados / 30) * 100, 100);
  const complete = p.puntosAcumulados >= 30;
  const faltantes = Math.max(30 - p.puntosAcumulados, 0);

  const formatDate = (d: Date | string | undefined | null) => {
    if (!d) return "Desconocida";
    const date = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(date.getTime())) return "Desconocida";
    return date.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
  };

  const renderValue = (val: string | number | null | undefined, suffix?: string) => {
    if (val === null || val === undefined) return <span className="text-null">Sin dato</span>;
    return <span>{val}{suffix || ""}</span>;
  };

  return (
    <div className="animate-slide-up">
      {/* Breadcrumb / Back */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
        <button className="btn btn--ghost" onClick={onBack} style={{ gap: "var(--space-2)" }}>
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          Participantes
        </button>
        <span style={{ color: "var(--text-medium)" }}>/</span>
        <span style={{ fontSize: "var(--fs-label)", color: "var(--text-secondary)" }}>{p.nombreCompleto}</span>
      </div>

      {/* Header Profile Card */}
      <div className="card" style={{ marginBottom: "var(--space-4)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: "300px", height: "100%", background: "linear-gradient(90deg, transparent, var(--pg-l05))", opacity: 0.5, zIndex: 0 }} />
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1, marginBottom: "var(--space-3)" }}>
          <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "center" }}>
            <div className="avatar avatar--xl avatar--brand" style={{ fontSize: "24px", width: 80, height: 80 }}>{getInitials(p.nombreCompleto)}</div>
            <div>
              <h2 style={{ fontSize: "var(--fs-h2)", margin: 0, lineHeight: 1.2 }}>{p.nombreCompleto}</h2>
              <div style={{ fontSize: "var(--fs-label)", color: "var(--text-secondary)", marginTop: "var(--space-2)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                <i className="fa-regular fa-envelope" /> {p.correo} <span style={{ color: "var(--neutral-l04)" }}>|</span> <i className="fa-solid fa-phone" /> {p.celular}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
             <span className={`badge ${p.disponibilidad === "Disponible" ? "badge--success" : p.disponibilidad === "En enfriamiento" ? "badge--warning" : "badge--error"}`}>
               {p.disponibilidad}
             </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginBottom: "var(--space-4)", position: "relative", zIndex: 1 }}>
           {p.segmento && <span className="badge badge--neutral">{p.segmento}</span>}
           {p.producto && <span className="badge badge--neutral">{p.producto}</span>}
           {p.perfil && <span className="badge badge--neutral">{p.perfil}</span>}
           {p.esCliente && <span className="badge badge--brand"><i className="fa-solid fa-star" style={{fontSize: "10px", marginRight: 4}}/> Cliente Preferente</span>}
        </div>

        <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
          <button className="btn btn--primary" onClick={() => onAddToProject?.(p)}><i className="fa-solid fa-folder-plus" aria-hidden="true" /> Agregar a proyecto</button>
          <button className="btn btn--secondary" onClick={() => onSendEmail?.(p)}><i className="fa-solid fa-envelope" aria-hidden="true" /> Enviar mensaje</button>
          <button className="btn btn--secondary" onClick={() => onEdit?.(p)}><i className="fa-solid fa-pen" aria-hidden="true" /> Editar perfil</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", alignItems: "start" }}>
        
        {/* Columna Izquierda */}
        <div>
          {/* Puntos Premium Card */}
        <div className="card" style={{ background: "linear-gradient(135deg, var(--pg-00) 0%, var(--success-dark) 100%)", color: "white", marginBottom: "var(--space-5)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
             <div style={{ fontSize: "var(--fs-label)", fontWeight: "var(--fw-medium)" as any }}>Programa de Recompensas</div>
             <i className="fa-solid fa-gift" style={{ fontSize: "20px", opacity: 0.8 }} />
          </div>
          {complete ? (
            <div style={{ background: "rgba(255,255,255,0.2)", padding: "var(--space-3)", borderRadius: "var(--radius-sm)", display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
              <i className="fa-solid fa-circle-check" aria-hidden="true" style={{ fontSize: "20px" }} />
              <span>¡Objetivo cumplido! <strong>{p.puntosAcumulados} pts.</strong> Listo para enviar su bono.</span>
            </div>
          ) : (
            <>
              <div style={{ fontSize: "24px", fontWeight: "var(--fw-bold)" as any, marginBottom: "var(--space-2)" }}>
                {p.puntosAcumulados} <span style={{ fontSize: "var(--fs-caption)", fontWeight: "normal", opacity: 0.8 }}>/ 30 pts</span>
              </div>
              <div className="progress-bar" style={{ height: 6, background: "rgba(255,255,255,0.3)" }}>
                <div className="progress-bar__track" style={{ height: "100%", background: "transparent" }}>
                  <div className="progress-bar__fill" style={{ width: `${pct}%`, height: "100%", background: "white" }} />
                </div>
              </div>
              <div style={{ fontSize: "var(--fs-caption)", opacity: 0.8, marginTop: "var(--space-2)" }}>
                Faltan {faltantes} puntos para el próximo bono de $30.000
              </div>
            </>
          )}
        </div>

        {/* Datos en grid con iconos */}
        <div className="slide-over__section" style={{ border: "1px solid var(--neutral-l03)", borderRadius: "var(--radius-md)", padding: "var(--space-4)", marginBottom: "var(--space-5)" }}>
          <h3 style={{ fontSize: "var(--fs-label)", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-secondary)", marginBottom: "var(--space-4)" }}>Perfil Socio-Demográfico</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <div>
              <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)", marginBottom: "4px" }}>Segmento</div>
              <div style={{ fontWeight: "var(--fw-medium)" as any, display: "flex", alignItems: "center", gap: "var(--space-2)" }}><i className="fa-solid fa-chart-pie" style={{ color: "var(--text-medium)" }}/> {renderValue(p.segmento)}</div>
            </div>
            <div>
              <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)", marginBottom: "4px" }}>Perfil de inversión</div>
              <div style={{ fontWeight: "var(--fw-medium)" as any, display: "flex", alignItems: "center", gap: "var(--space-2)" }}><i className="fa-solid fa-arrow-trend-up" style={{ color: "var(--text-medium)" }}/> {renderValue(p.perfil)}</div>
            </div>
            <div>
              <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)", marginBottom: "4px" }}>Producto principal</div>
              <div style={{ fontWeight: "var(--fw-medium)" as any, display: "flex", alignItems: "center", gap: "var(--space-2)" }}><i className="fa-solid fa-box" style={{ color: "var(--text-medium)" }}/> {renderValue(p.producto)}</div>
            </div>
            <div>
              <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)", marginBottom: "4px" }}>Edad</div>
              <div style={{ fontWeight: "var(--fw-medium)" as any, display: "flex", alignItems: "center", gap: "var(--space-2)" }}><i className="fa-solid fa-cake-candles" style={{ color: "var(--text-medium)" }}/> {renderValue(p.edad, " años")}</div>
            </div>
          </div>
        </div>

        </div>

        {/* Columna Derecha */}
        <div>
          {/* Etiquetas & Consentimiento */}
          <div className="card" style={{ marginBottom: "var(--space-4)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
              <div>
                 <h3 style={{ fontSize: "var(--fs-label)", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-secondary)", marginBottom: "var(--space-3)" }}>Etiquetas</h3>
                 <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                   {!(p.etiquetas?.length) && <span className="text-null" style={{ fontSize: "var(--fs-caption)" }}>Sin etiquetas adicionales</span>}
                   {(p.etiquetas || []).map((tag, i) => (
                     <span key={i} className="chip chip--tag" style={{ background: "var(--neutral-l02)" }}>
                       {tag}
                       <button className="chip__remove" aria-label={`Eliminar ${tag}`}>
                         <i className="fa-solid fa-xmark" aria-hidden="true" />
                       </button>
                     </span>
                   ))}
                   <button className="chip" style={{ borderStyle: "dashed", background: "transparent", cursor: "pointer" }}>
                     <i className="fa-solid fa-plus" aria-hidden="true" />
                   </button>
                 </div>
              </div>
              <div>
                <h3 style={{ fontSize: "var(--fs-label)", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-secondary)", marginBottom: "var(--space-3)" }}>Habeas Data</h3>
                {p.consentimiento === "N/A — cliente" ? (
                   <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                     <i className="fa-solid fa-shield-check" style={{ color: "var(--success-dark)" }}/>
                     <span style={{ fontSize: "var(--fs-caption)" }}>Incluido en vinculación</span>
                   </div>
                ) : p.consentimiento === "Vigente" ? (
                   <span className="badge badge--success">Vigente</span>
                ) : (
                   <div>
                      <span className="badge badge--error" style={{ marginBottom: "var(--space-2)", display: "inline-block" }}>Pendiente</span>
                      <button className="btn btn--secondary btn--sm" style={{ padding: "4px 8px", fontSize: "11px" }}>Solicitar por correo</button>
                   </div>
                )}
              </div>
            </div>
          </div>

          {/* Historial */}
          <div className="card">
            <h3 style={{ fontSize: "var(--fs-label)", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-secondary)", marginBottom: "var(--space-4)" }}>Historial de Participación</h3>
            {!(p.historial?.length) ? (
              <div className="empty-state" style={{ padding: "var(--space-4)" }}>
                 <i className="fa-solid fa-clock-rotate-left" />
                 <p>Sin historial de participación reciente</p>
              </div>
            ) : (
              <div className="timeline">
                {[...(p.historial || [])].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).map((h, i) => (
                  <div key={i} className="timeline__item">
                    <div className="timeline__dot" style={{ background: "var(--brand-primary)", borderColor: "white" }} />
                    <div className="timeline__content" style={{ background: "var(--neutral-l01)", padding: "var(--space-3)", borderRadius: "var(--radius-sm)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-1)" }}>
                         <strong style={{ fontSize: "var(--fs-label)" }}>{h.proyectoNombre}</strong>
                         <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{formatDate(h.fecha)}</span>
                      </div>
                      <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)", display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                          <span>{h.tipo}</span>
                          <span>•</span>
                          <span style={{ color: "var(--brand-primary)", fontWeight: "var(--fw-bold)" as any }}>+{h.puntos} pts</span>
                          <span>•</span>
                          {h.bonoEnviado ? (
                             <span style={{ color: "var(--success-dark)" }}><i className="fa-solid fa-gift" /> Bono enviado</span>
                          ) : (
                             <span style={{ color: "var(--warning-dark)" }}>Bono pendiente</span>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div style={{ textAlign: "right", marginTop: "var(--space-4)", fontSize: "11px", color: "var(--text-secondary)" }}>
              Última edición: {formatDate(p.fechaUltimaEdicion)} por {p.editadoPor || 'Sistema'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantProfile;
