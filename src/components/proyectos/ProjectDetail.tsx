import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import type { Participante, Proyecto, EmailTracking } from "@/types";
import AddParticipantToProject from "./AddParticipantToProject";
import SendBonoModal from "./SendBonoModal";
import EmailTrackingTable from "./EmailTrackingTable";
import SendInvitationModal from "./SendInvitationModal";
import { toast } from "sonner";

interface Props {
  project: Proyecto;
  onBack: () => void;
}

const ProjectDetail = ({ project: initialProject, onBack }: Props) => {
  const store = useAppStore();
  const project = store.proyectos.find(p => p.id === initialProject.id) || initialProject;
  const allParticipantes = store.participantes;
  const emailTracking = store.emailTracking;

  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [bonoTarget, setBonoTarget] = useState<Participante | null>(null);
  const [briefExpanded, setBriefExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<"participantes" | "emails" | "recursos">("participantes");
  const [invitationTarget, setInvitationTarget] = useState<{ show: boolean; participant?: Participante }>({ show: false });
  const [newLink, setNewLink] = useState({ titulo: "", url: "", tipo: "otro" as const });
  const [menuOpen, setMenuOpen] = useState(false);

  const pct = Math.round((project.participantes / project.cuota) * 100);
  const assigned = allParticipantes.filter(p =>
    p.historial.some(h => h.proyectoId === project.id)
  );

  const projectEmails = emailTracking.filter(e => e.proyectoId === project.id);

  const getInitials = (name: string) => name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();

  const formatDate = (d: string) => {
    const date = new Date(d + "T00:00:00");
    return date.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
  };

  const estadoBadge = (estado: string) => {
    switch (estado) {
      case "En campo": return "badge--brand";
      case "Reclutando": return "badge--info";
      case "Planeando": return "badge--neutral";
      case "Cerrado": return "badge--neutral";
      default: return "badge--neutral";
    }
  };

  const daysRemaining = () => {
    const end = new Date(project.fin + "T00:00:00");
    const now = new Date();
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const days = daysRemaining();

  const handleAddParticipant = (participant: Participante) => {
    const sessionType = project.tipo === "Test remoto" ? "Test remoto" : "Entrevista";
    const initialPoints = project.tipo === "Test remoto" ? 10 : 15;
    
    const newHistory = [
      ...participant.historial,
      { 
        proyectoId: project.id, 
        proyectoNombre: project.nombre, 
        fecha: new Date(), 
        tipo: sessionType, 
        puntos: 0, // Inicia en 0 hasta que completen
        bonoEnviado: false,
        estadoInProyecto: "Candidato" as const
      }
    ];

    store.updateParticipante(participant.id, { historial: newHistory });
    store.updateProyecto(project.id, { participantes: project.participantes + 1 });
    toast.success(`${participant.nombreCorto} agregado al proyecto`);
    setShowAddParticipant(false);
  };

  const handleCompletarSesion = (participant: Participante) => {
    const pointsToAdd = project.tipo === "Test remoto" ? 10 : 15;
    const newPoints = participant.puntosAcumulados + pointsToAdd;
    
    const newHistory = participant.historial.map(h => 
      h.proyectoId === project.id ? { ...h, puntos: pointsToAdd } : h
    );

    store.updateParticipante(participant.id, { 
      puntosAcumulados: newPoints,
      historial: newHistory,
      disponibilidad: "En enfriamiento"
    });

    // Registrar actividad
    store.addActividad({
      accion: "Sesión completada",
      participante: participant.nombreCorto,
      disenador: "Usuario",
      tiempo: "Ahora"
    });

    // Enviar P7 (Seguimiento de puntos)
    const p7: EmailTracking = {
      id: `ET${Date.now()}-P7`,
      proyectoId: project.id,
      participanteId: participant.id,
      participanteNombre: participant.nombreCompleto,
      participanteCorreo: participant.correo,
      plantillaCodigo: "P7",
      plantillaNombre: "¿Cuántos puntos tienes?",
      estado: "Enviado",
      fechaEnvio: new Date(),
      fechaApertura: null,
      enviadoPor: "Sistema (Automático)"
    };
    store.registrarEnvio(p7);

    // Trigger P8 si llega a 30
    if (newPoints >= 30) {
      toast(`${participant.nombreCorto} alcanzó 30 puntos. Asignando bono FIFO...`, {
        icon: "🎉",
      });
      
      const bonoDisponible = store.bonos.find(b => b.estado === "Disponible");
      if (bonoDisponible) {
        store.asignarBono(bonoDisponible.guid, participant.id, project.id);
        
        // Registrar envío de P8
        const p8: EmailTracking = {
          id: `ET${Date.now()}-P8`,
          proyectoId: project.id,
          participanteId: participant.id,
          participanteNombre: participant.nombreCompleto,
          participanteCorreo: participant.correo,
          plantillaCodigo: "P8",
          plantillaNombre: "Agradecimiento + código de bono",
          estado: "Enviado",
          fechaEnvio: new Date(),
          fechaApertura: null,
          enviadoPor: "Sistema (Automático)"
        };
        store.registrarEnvio(p8);

        // Marcar bono como enviado en el historial del participante para este proyecto
        const historyWithBono = newHistory.map(h => 
          h.proyectoId === project.id ? { ...h, bonoEnviado: true } : h
        );
        store.updateParticipante(participant.id, { historial: historyWithBono });
        
        toast.success(`Bono ${bonoDisponible.codigo} enviado a ${participant.correo}`);
      } else {
        toast.error("No hay bonos disponibles para asignación automática");
      }
    } else {
      toast.info(`${participant.nombreCorto} ahora tiene ${newPoints} puntos`);
    }
  };

  const handleSendBono = (bonoCode: string) => {
    if (!bonoTarget) return;
    
    const bono = store.bonos.find(b => b.codigo === bonoCode);
    if (bono) {
      store.asignarBono(bono.guid, bonoTarget.id, project.id);
      
      // Registrar envío de P8 (o similar)
      const p8: EmailTracking = {
        id: `ET${Date.now()}-MANUAL`,
        proyectoId: project.id,
        participanteId: bonoTarget.id,
        participanteNombre: bonoTarget.nombreCompleto,
        participanteCorreo: bonoTarget.correo,
        plantillaCodigo: "P8",
        plantillaNombre: "Agradecimiento + código de bono",
        estado: "Enviado",
        fechaEnvio: new Date(),
        fechaApertura: null,
        enviadoPor: "Usuario"
      };
      store.registrarEnvio(p8);

      // Actualizar historial
      const newHistory = bonoTarget.historial.map(h => 
        h.proyectoId === project.id ? { ...h, bonoEnviado: true } : h
      );
      store.updateParticipante(bonoTarget.id, { historial: newHistory });

      toast.success(`Bono ${bonoCode} asignado manualmente`);
    }
    setBonoTarget(null);
  };

  const handleSendInvitation = (data: { participante: Participante, plantilla: any }) => {
    const tracking: EmailTracking = {
      id: `ET${Date.now()}`,
      proyectoId: project.id,
      participanteId: data.participante.id,
      participanteNombre: data.participante.nombreCompleto,
      participanteCorreo: data.participante.correo,
      plantillaCodigo: data.plantilla.codigo,
      plantillaNombre: data.plantilla.nombre,
      estado: "Enviado",
      fechaEnvio: new Date(),
      fechaApertura: null,
      enviadoPor: "Usuario"
    };
    store.registrarEnvio(tracking);
    
    // Actualizar estado a "Invitado" en el historial del proyecto
    const newHistory = data.participante.historial.map(h => 
      h.proyectoId === project.id ? { ...h, estadoInProyecto: "Invitado" as const } : h
    );
    store.updateParticipante(data.participante.id, { historial: newHistory });

    toast.success(`Correo "${data.plantilla.nombre}" enviado a ${data.participante.nombreCorto}`);
    setInvitationTarget({ show: false });
  };

  const handleAddLink = () => {
    if (!newLink.titulo || !newLink.url) return;
    const added = { id: `L${Date.now()}`, titulo: newLink.titulo, url: newLink.url, tipo: newLink.tipo };
    const links = [...(project.links || []), added];
    store.updateProyecto(project.id, { links });
    setNewLink({ titulo: "", url: "", tipo: "otro" });
    toast.success("Enlace agregado al proyecto");
  };

  const handleRemoveLink = (id: string) => {
    const links = (project.links || []).filter(l => l.id !== id);
    store.updateProyecto(project.id, { links });
    toast.success("Enlace removido");
  };

  return (
    <>
      <div className="animate-fade-in">
        {/* Breadcrumb / Back */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
          <button className="btn btn--ghost" onClick={onBack} style={{ gap: "var(--space-2)" }}>
            <i className="fa-solid fa-arrow-left" aria-hidden="true" />
            Proyectos
          </button>
          <span style={{ color: "var(--text-medium)" }}>/</span>
          <span style={{ fontSize: "var(--fs-label)", color: "var(--text-secondary)" }}>{project.nombre}</span>
        </div>

        {/* Header */}
        <div className="card" style={{ marginBottom: "var(--space-4)", position: "relative", overflow: "hidden" }}>
          {/* Subtle background pattern/gradient */}
          <div style={{ position: "absolute", top: 0, right: 0, width: "300px", height: "100%", background: "linear-gradient(90deg, transparent, var(--pg-l05))", opacity: 0.5, zIndex: 0 }} />
          
          <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
            <div style={{ width: 64, height: 64, borderRadius: "var(--radius-lg)", background: "var(--pg-00)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "var(--shadow-md)" }}>
              <i className="fa-solid fa-folder-open" aria-hidden="true" style={{ color: "white", fontSize: "var(--fs-h3)" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-1)" }}>
                <h1 style={{ margin: 0, fontSize: "var(--fs-h2)", fontWeight: "var(--fw-bold)" as any }}>{project.nombre}</h1>
                <span className={`badge ${estadoBadge(project.estado)}`} style={{ padding: "4px 12px", borderRadius: "var(--radius-full)" }}>
                  {project.estado === "En campo" && <span className="pulse-dot" style={{ marginRight: "var(--space-1)" }} />}
                  {project.estado}
                </span>
              </div>
              <div style={{ fontSize: "var(--fs-label)", color: "var(--text-secondary)", marginBottom: "var(--space-4)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                <i className="fa-solid fa-user-tie" /> {project.responsable} 
                <span style={{ color: "var(--neutral-l04)" }}>|</span>
                <i className="fa-solid fa-calendar-alt" /> {formatDate(project.inicio)} — {formatDate(project.fin)}
                <span className="badge badge--neutral" style={{ fontSize: "10px" }}>{project.tipo}</span>
              </div>
              <div style={{ display: "flex", gap: "var(--space-3)" }}>
                {project.estado !== "Cerrado" && (
                  <button className="btn btn--primary" onClick={() => setShowAddParticipant(true)}>
                    <i className="fa-solid fa-user-plus" aria-hidden="true" /> Agregar participante
                  </button>
                )}
                <button className="btn btn--secondary" onClick={() => setInvitationTarget({ show: true })}>
                  <i className="fa-solid fa-envelope" aria-hidden="true" /> Enviar invitación
                </button>
                <div className="dropdown" style={{ marginLeft: "auto" }}>
                   <button 
                     className="btn btn--secondary btn--icon" 
                     onClick={() => setMenuOpen(!menuOpen)}
                   >
                     <i className="fa-solid fa-ellipsis" />
                   </button>
                   {menuOpen && (
                     <>
                       <div className="overlay" style={{ background: "transparent", zIndex: 40 }} onClick={() => setMenuOpen(false)} />
                       <div className="dropdown__menu" style={{ right: 0, left: "auto", zIndex: 50 }}>
                         <button className="dropdown__item" style={{ color: "var(--error-dark)" }} onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("Intentando eliminar proyecto desde detalle:", project.id);
                            setTimeout(() => {
                              if (window.confirm(`¿Estás seguro de eliminar el proyecto "${project.nombre}"?`)) {
                                console.log("Confirmado: eliminando proyecto mediante detalle");
                                setMenuOpen(false);
                                onBack();
                                store.deleteProyecto(project.id);
                              } else {
                                setMenuOpen(false);
                              }
                            }, 50);
                         }}>
                           <i className="fa-solid fa-trash" style={{ width: 16 }} /> Eliminar proyecto
                         </button>
                       </div>
                     </>
                   )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress + Brief row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
          {/* Progress */}
          <div className="card card--hover">
            <div style={{ fontSize: "var(--fs-caption)", fontWeight: "var(--fw-bold)" as any, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--space-3)", display: "flex", justifyContent: "space-between" }}>
              <span>Progreso de reclutamiento</span>
              <span style={{ color: pct >= 100 ? "var(--pg-00)" : "var(--text-secondary)" }}>{pct}%</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-1)", marginBottom: "var(--space-3)" }}>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: "36px", fontWeight: "var(--fw-bold)" as any, color: "var(--text-primary)" }}>{project.participantes}</span>
              <span style={{ fontSize: "var(--fs-label)", color: "var(--text-secondary)" }}>/ {project.cuota} cupos</span>
            </div>
            <div className="progress-bar" style={{ height: 10, background: "var(--neutral-l03)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
              <div 
                className={`progress-bar__fill ${pct >= 100 ? "progress-bar__fill--complete" : ""}`} 
                style={{ 
                  width: `${Math.min(pct, 100)}%`, 
                  height: "100%", 
                  background: pct >= 100 ? "var(--pg-00)" : "linear-gradient(90deg, var(--pg-00), var(--pg-l04))",
                  transition: "width 1s ease-in-out" 
                }} 
              />
            </div>
            {days > 0 && days <= 7 && project.estado !== "Cerrado" && (
              <div className="status-alert" style={{ marginTop: "var(--space-4)", display: "flex", alignItems: "center", gap: "var(--space-2)", background: "var(--warning-light)", padding: "var(--space-2) var(--space-3)", borderRadius: "var(--radius-sm)", color: "#856404", fontSize: "var(--fs-caption)" }}>
                <i className="fa-solid fa-clock-rotate-left pulse-icon" />
                <span>Quedan <strong>{days} días</strong> para finalizar el reclutamiento.</span>
              </div>
            )}
          </div>

          {/* Brief */}
          <div className="card">
            <div
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", marginBottom: briefExpanded ? "var(--space-3)" : 0 }}
              onClick={() => setBriefExpanded(!briefExpanded)}
            >
              <div style={{ fontSize: "var(--fs-caption)", fontWeight: "var(--fw-bold)" as any, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                <i className="fa-solid fa-clipboard-list" aria-hidden="true" />
                Brief de la investigación
              </div>
              <i className={`fa-solid fa-chevron-${briefExpanded ? "up" : "down"}`} aria-hidden="true" style={{ color: "var(--text-secondary)", fontSize: "var(--fs-caption)" }} />
            </div>
            {briefExpanded && (
              <div>
                {project.objetivo ? (
                  <p style={{ fontSize: "var(--fs-label)", color: "var(--text-primary)", margin: 0, lineHeight: 1.6, marginBottom: "var(--space-3)" }}>{project.objetivo}</p>
                ) : (
                  <div style={{ padding: "var(--space-3)", background: "var(--neutral-l02)", borderRadius: "var(--radius-sm)", textAlign: "center", marginBottom: "var(--space-3)" }}>
                    <i className="fa-solid fa-pen-to-square" aria-hidden="true" style={{ color: "var(--neutral-l04)", fontSize: 20, display: "block", marginBottom: "var(--space-2)" }} />
                    <p style={{ fontSize: "var(--fs-label)", color: "var(--text-secondary)", margin: 0 }}>
                      Aún no se ha definido el brief de esta investigación.
                    </p>
                  </div>
                )}
                <div className="data-grid">
                  <div className="data-grid__item">
                    <label>Tipo de estudio</label>
                    <span>{project.tipo}</span>
                  </div>
                  <div className="data-grid__item">
                    <label>Responsable</label>
                    <span>{project.responsable}</span>
                  </div>
                </div>
                {project.enlace && (
                  <div style={{ marginTop: "var(--space-3)" }}>
                    <a href={project.enlace} target="_blank" rel="noopener noreferrer" style={{ fontSize: "var(--fs-label)", color: "var(--text-brand)", display: "inline-flex", alignItems: "center", gap: "var(--space-1)" }}>
                      <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" style={{ fontSize: "var(--fs-caption)" }} />
                      Abrir enlace principal del test
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "2px solid var(--neutral-l03)", marginBottom: "var(--space-4)" }}>
          <button
            className="btn btn--ghost"
            style={{
              borderRadius: 0,
              borderBottom: activeTab === "participantes" ? "2px solid var(--pg-00)" : "2px solid transparent",
              color: activeTab === "participantes" ? "var(--text-brand)" : "var(--text-secondary)",
              fontWeight: activeTab === "participantes" ? "var(--fw-bold)" as any : "var(--fw-medium)" as any,
              marginBottom: "-2px",
              paddingBottom: "var(--space-3)",
            }}
            onClick={() => setActiveTab("participantes")}
          >
            <i className="fa-solid fa-users" aria-hidden="true" /> Participantes ({assigned.length})
          </button>
          <button
            className="btn btn--ghost"
            style={{
              borderRadius: 0,
              borderBottom: activeTab === "emails" ? "2px solid var(--pg-00)" : "2px solid transparent",
              color: activeTab === "emails" ? "var(--text-brand)" : "var(--text-secondary)",
              fontWeight: activeTab === "emails" ? "var(--fw-bold)" as any : "var(--fw-medium)" as any,
              marginBottom: "-2px",
              paddingBottom: "var(--space-3)",
            }}
            onClick={() => setActiveTab("emails")}
          >
            <i className="fa-solid fa-paper-plane" aria-hidden="true" /> Tracking de correos ({projectEmails.length})
          </button>
          <button
            className="btn btn--ghost"
            style={{
              borderRadius: 0,
              borderBottom: activeTab === "recursos" ? "2px solid var(--pg-00)" : "2px solid transparent",
              color: activeTab === "recursos" ? "var(--text-brand)" : "var(--text-secondary)",
              fontWeight: activeTab === "recursos" ? "var(--fw-bold)" as any : "var(--fw-medium)" as any,
              marginBottom: "-2px",
              paddingBottom: "var(--space-3)",
            }}
            onClick={() => setActiveTab("recursos")}
          >
            <i className="fa-solid fa-link" aria-hidden="true" /> Recursos y Anexos
          </button>
        </div>

        {/* Tab content */}
        {activeTab === "participantes" && (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {assigned.length === 0 ? (
              <div className="empty-state">
                <i className="fa-solid fa-users" aria-hidden="true" />
                <p>Aún no hay participantes asignados</p>
                {project.estado !== "Cerrado" && (
                  <button className="btn btn--primary" onClick={() => setShowAddParticipant(true)}>
                    <i className="fa-solid fa-user-plus" aria-hidden="true" /> Agregar primer participante
                  </button>
                )}
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Participante</th>
                    <th>Tipo</th>
                    <th>Puntos</th>
                    <th>Bono</th>
                    <th style={{ width: 100 }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {assigned.map(p => {
                    const session = p.historial.find(h => h.proyectoId === project.id);
                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="data-table__name">
                            <div className="avatar avatar--sm avatar--brand">{getInitials(p.nombreCompleto)}</div>
                            <div className="data-table__name-text">
                              <span className="data-table__name-primary">{p.nombreCompleto}</span>
                              <span className="data-table__name-secondary">{p.correo}</span>
                            </div>
                          </div>
                        </td>
                        <td>{session ? <span className="badge badge--neutral">{session.tipo}</span> : "—"}</td>
                        <td>
                          {session ? (
                            <span style={{ fontSize: "var(--fs-label)", color: "var(--text-brand)", fontWeight: "var(--fw-bold)" as any }}>+{session.puntos} pts</span>
                          ) : "—"}
                        </td>
                        <td>
                          {session?.bonoEnviado ? (
                            <span className="badge badge--success">
                              <i className="fa-solid fa-check" aria-hidden="true" /> Enviado
                            </span>
                          ) : (
                            <div style={{ display: "flex", gap: "var(--space-1)" }}>
                              {session && session.puntos === 0 && (
                                <button
                                  className="btn btn--secondary btn--sm"
                                  onClick={() => handleCompletarSesion(p)}
                                  title="Marcar sesión como completada"
                                  style={{ padding: "2px 8px", fontSize: "11px" }}
                                >
                                  <i className="fa-solid fa-check-double" aria-hidden="true" /> Completar
                                </button>
                              )}
                              <button
                                className="badge badge--warning"
                                style={{ cursor: "pointer", border: "none" }}
                                onClick={() => setBonoTarget(p)}
                                title="Enviar bono manualmente"
                              >
                                <i className="fa-solid fa-gift" aria-hidden="true" /> {session && session.puntos > 0 ? "Enviar bono" : ""}
                              </button>
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "var(--space-1)" }}>
                            <button
                              className="btn btn--ghost btn--icon"
                              aria-label="Enviar invitación"
                              title="Enviar invitación"
                              onClick={() => setInvitationTarget({ show: true, participant: p })}
                            >
                              <i className="fa-solid fa-envelope" aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "emails" && (
          <EmailTrackingTable emails={projectEmails} />
        )}

        {activeTab === "recursos" && (
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
              <h3 style={{ fontSize: "var(--fs-h4)" }}>Enlaces relevantes</h3>
            </div>

            <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-4)", alignItems: "flex-end", flexWrap: "wrap" }}>
               <div className="input-field" style={{ flex: 1, minWidth: 200 }}>
                 <label className="input-field__label">Título</label>
                 <input className="input-field__input" value={newLink.titulo} onChange={e => setNewLink({...newLink, titulo: e.target.value})} placeholder="Ej. Guión sesión..." />
               </div>
               <div className="input-field" style={{ flex: 2, minWidth: 200 }}>
                 <label className="input-field__label">URL</label>
                 <input className="input-field__input" type="url" value={newLink.url} onChange={e => setNewLink({...newLink, url: e.target.value})} placeholder="https://" />
               </div>
               <div className="input-field" style={{ width: 120 }}>
                 <label className="input-field__label">Tipo</label>
                 <select className="select-field" value={newLink.tipo} onChange={e => setNewLink({...newLink, tipo: e.target.value as any})} style={{ width: "100%" }}>
                   <option value="otro">Otro</option>
                   <option value="dovetail">Dovetail</option>
                   <option value="sheets">Sheets</option>
                   <option value="figma">Figma</option>
                 </select>
               </div>
               <button className="btn btn--primary" onClick={handleAddLink} disabled={!newLink.titulo || !newLink.url}>
                 Añadir enlace
               </button>
            </div>

            {(!project.links || project.links.length === 0) ? (
              <div className="empty-state">
                <i className="fa-solid fa-link" aria-hidden="true" />
                <p>No hay recursos vinculados a este proyecto</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "var(--space-3)" }}>
                {project.links.map(l => (
                   <div key={l.id} className="card card--hover" style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3)" }}>
                      <div style={{ width: 40, height: 40, background: "var(--neutral-l02)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <i className={`fa-solid ${l.tipo === 'dovetail' ? 'fa-paw' : l.tipo === 'sheets' ? 'fa-file-excel' : l.tipo === 'figma' ? 'fa-pen-nib' : 'fa-link'}`} style={{ color: "var(--text-secondary)" }} />
                      </div>
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <div style={{ fontWeight: "var(--fw-medium)" as any }}>{l.titulo}</div>
                        <a href={l.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "var(--fs-caption)", color: "var(--text-brand)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
                          {l.url}
                        </a>
                      </div>
                      <button className="btn btn--icon btn--ghost" onClick={() => handleRemoveLink(l.id)} style={{ color: "var(--error-dark)" }}>
                        <i className="fa-solid fa-xmark" />
                      </button>
                   </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Participant Modal */}
      {showAddParticipant && (
        <>
          <div className="overlay" onClick={() => setShowAddParticipant(false)} />
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 201, pointerEvents: "none" }}>
            <div style={{ pointerEvents: "all" }}>
              <AddParticipantToProject project={project} onAdd={handleAddParticipant} onClose={() => setShowAddParticipant(false)} />
            </div>
          </div>
        </>
      )}

      {/* Send Bono Modal */}
      {bonoTarget && (
        <>
          <div className="overlay" onClick={() => setBonoTarget(null)} />
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 201, pointerEvents: "none" }}>
            <div style={{ pointerEvents: "all" }}>
              <SendBonoModal participant={bonoTarget} project={project} onSend={handleSendBono} onClose={() => setBonoTarget(null)} />
            </div>
          </div>
        </>
      )}

      {/* Send Invitation Modal */}
      {invitationTarget.show && (
        <>
          <div className="overlay" onClick={() => setInvitationTarget({ show: false })} />
          <SendInvitationModal
            project={project}
            participant={invitationTarget.participant}
            onSend={handleSendInvitation}
            onClose={() => setInvitationTarget({ show: false })}
          />
        </>
      )}
    </>
  );
};

export default ProjectDetail;
