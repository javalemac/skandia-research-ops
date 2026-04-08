import { useState, useMemo } from "react";
import { useAppStore } from "@/store/appStore";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Participante, Plantilla } from "@/types";
import ParticipantProfile from "@/components/participantes/ParticipantProfile";
import NewParticipantModal from "@/components/participantes/NewParticipantModal";
import BulkUploadModal from "@/components/participantes/BulkUploadModal";
import AddParticipantToProject from "@/components/proyectos/AddParticipantToProject";
import SendInvitationModal from "@/components/proyectos/SendInvitationModal";

const segmentos = ["Finanzas Personales", "Elite", "Privilegio", "Wealth", "Corporativo", "Sin segmento"] as const;
const disponibilidades = ["Disponible", "En enfriamiento", "No contactar"] as const;
const perfiles = ["Conservador", "Moderado", "Arriesgado", "Empowered", "Sin dato"] as const;
const clienteOpts = ["Sí", "No"] as const;

const Participantes = () => {
  const isMobile = useIsMobile();
  const { 
    participantes: data, 
    addParticipante, 
    updateParticipante, 
    importarParticipantes, 
    marcarNoContactar,
    deleteParticipante,
    proyectos,
    registrarEnvio,
    isLoading
  } = useAppStore();

  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Participante | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  const [addProjectTarget, setAddProjectTarget] = useState<Participante | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [sendEmailTarget, setSendEmailTarget] = useState<Participante | null>(null);
  const [editTarget, setEditTarget] = useState<Participante | null>(null);
  
  const [filters, setFilters] = useState<{
    segmento: string[];
    disponibilidad: string[];
    perfil: string[];
    cliente: string[];
  }>({ segmento: [], disponibilidad: [], perfil: [], cliente: [] });

  const toggleFilter = (group: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [group]: prev[group].includes(value)
        ? prev[group].filter(v => v !== value)
        : [...prev[group], value],
    }));
  };

  const filtered = useMemo(() => {
    return data.filter(p => {
      if (search) {
        const q = search.toLowerCase();
        if (!p.nombreCompleto.toLowerCase().includes(q) && !p.correo.toLowerCase().includes(q)) return false;
      }
      if (filters.segmento.length) {
        const val = p.segmento ?? "Sin segmento";
        if (!filters.segmento.includes(val)) return false;
      }
      if (filters.disponibilidad.length && !filters.disponibilidad.includes(p.disponibilidad)) return false;
      if (filters.perfil.length) {
        const val = p.perfil ?? "Sin dato";
        if (!filters.perfil.includes(val)) return false;
      }
      if (filters.cliente.length) {
        if (filters.cliente.includes("Sí") && p.esCliente !== true) return false;
        if (filters.cliente.includes("No") && p.esCliente !== false) return false;
      }
      return true;
    });
  }, [data, search, filters]);

  const getInitials = (name: string) => name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();

  const handleSendInvitation = (data: { participante: Participante; plantilla: Plantilla; variables: Record<string, string> }) => {
    const tracking: any = {
      id: `ET${Date.now()}`,
      proyectoId: "GLOBAL", // Opcional si no viene de un proyecto específico
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
    registrarEnvio(tracking);
    setSendEmailTarget(null);
  };

  const handleAddToProject = () => {
    if (!addProjectTarget || !selectedProjectId) return;
    
    const project = proyectos.find(p => p.id === selectedProjectId);
    if (!project) return;

    const sessionType = project.tipo === "Test remoto" ? "Test remoto" : "Entrevista";
    const newHistory = [
      ...addProjectTarget.historial,
      { 
        proyectoId: project.id, 
        proyectoNombre: project.nombre, 
        fecha: new Date(), 
        tipo: sessionType, 
        puntos: 0,
        bonoEnviado: false,
        estadoInProyecto: "Candidato" as const
      }
    ];

    updateParticipante(addProjectTarget.id, { historial: newHistory });
    useAppStore.getState().updateProyecto(project.id, { participantes: project.participantes + 1 });
    
    setAddProjectTarget(null);
    setSelectedProjectId("");
  };

  const handleAddParticipant = (p: Participante) => {
    if (editTarget) {
      updateParticipante(editTarget.id, p);
      setEditTarget(null);
    } else {
      addParticipante(p);
      setShowNewModal(false);
    }
  };

  if (selectedProfile) {
    return (
      <ParticipantProfile
        participant={selectedProfile}
        onBack={() => setSelectedProfile(null)}
        onEdit={(p) => { setSelectedProfile(null); setEditTarget(p); }}
        onAddToProject={(p) => { setSelectedProfile(null); setAddProjectTarget(p); }}
        onSendEmail={(p) => { setSelectedProfile(null); setSendEmailTarget(p); }}
      />
    );
  }

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

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header__left">
          <h1>Participantes ({filtered.length})</h1>
        </div>
        <div className="page-header__right">
          <div className="search-box">
            <i className="fa-solid fa-magnifying-glass search-box__icon" aria-hidden="true" />
            <input
              className="input-field__input"
              placeholder="Buscar por nombre o correo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-box__clear" onClick={() => setSearch("")} aria-label="Limpiar búsqueda">
                <i className="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            )}
          </div>
          <button className="btn btn--secondary" onClick={() => setShowFilters(!showFilters)}>
            <i className="fa-solid fa-sliders" aria-hidden="true" /> Filtros
          </button>
          <button className="btn btn--secondary" onClick={() => setShowBulkUpload(true)}>
            <i className="fa-solid fa-file-arrow-up" aria-hidden="true" /> Carga masiva
          </button>
          <button className="btn btn--primary" onClick={() => setShowNewModal(true)}>
            <i className="fa-solid fa-plus" aria-hidden="true" /> Nuevo participante
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filters-panel">
          {([
            { key: "segmento" as const, label: "Segmento", options: segmentos },
            { key: "disponibilidad" as const, label: "Disponibilidad", options: disponibilidades },
            { key: "perfil" as const, label: "Perfil", options: perfiles },
            { key: "cliente" as const, label: "Cliente", options: clienteOpts },
          ]).map(group => (
            <div key={group.key} className="filters-panel__group">
              <div className="filters-panel__group-label">{group.label}</div>
              <div className="filters-panel__chips">
                {group.options.map(opt => (
                  <button
                    key={opt}
                    className={`chip ${filters[group.key].includes(opt) ? "chip--active" : ""}`}
                    onClick={() => toggleFilter(group.key, opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <i className="fa-solid fa-users" aria-hidden="true" />
          <p>No se encontraron participantes</p>
          <button className="btn btn--primary" onClick={() => { setSearch(""); setFilters({ segmento: [], disponibilidad: [], perfil: [], cliente: [] }); }}>
            Limpiar filtros
          </button>
        </div>
      ) : isMobile ? (
        <div className="mobile-list">
          {filtered.map(p => {
            const pct = Math.min((p.puntosAcumulados / 30) * 100, 100);
            const complete = p.puntosAcumulados >= 30;
            return (
              <div key={p.id} className="mobile-card animate-fade-in" onClick={() => setSelectedProfile(p)}>
                <div className="mobile-card__header">
                  <div className="avatar avatar--md avatar--brand">{getInitials(p.nombreCompleto)}</div>
                  <div className="data-table__name-text">
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
                      <span className="data-table__name-primary" style={{ fontWeight: "var(--fw-bold)" as any }}>{p.nombreCompleto}</span>
                      {p.esCliente && <i className="fa-solid fa-crown" style={{ color: "var(--warning-dark)", fontSize: 10 }} />}
                    </div>
                    <span className="data-table__name-secondary">{p.correo}</span>
                  </div>
                  <div className="mobile-card__actions" onClick={(e) => e.stopPropagation()}>
                    <div className="dropdown">
                      <button className="btn btn--ghost btn--icon" onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)}>
                        <i className="fa-solid fa-ellipsis" />
                      </button>
                      {openMenuId === p.id && (
                        <div className="dropdown__menu">
                          <button className="dropdown__item" onClick={() => { setAddProjectTarget(p); setOpenMenuId(null); }}>
                            <i className="fa-solid fa-folder-plus" /> Agregar a proyecto
                          </button>
                          <button className="dropdown__item" onClick={() => { setSendEmailTarget(p); setOpenMenuId(null); }}>
                            <i className="fa-regular fa-envelope" /> Enviar correo
                          </button>
                          <button className="dropdown__item" onClick={() => { setEditTarget(p); setOpenMenuId(null); }}>
                            <i className="fa-solid fa-pen" /> Editar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mobile-card__body">
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                     <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Segmento</span>
                     <span className="badge badge--neutral" style={{ fontSize: 10 }}>{p.segmento || "N/A"}</span>
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                     <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Consen.</span>
                     <span className={`badge ${p.consentimiento === "Vigente" ? "badge--success" : "badge--warning"}`} style={{ fontSize: 10 }}>{p.consentimiento}</span>
                   </div>
                </div>

                <div style={{ marginTop: 'var(--space-2)' }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Progreso Puntos</span>
                    <span style={{ fontWeight: "var(--fw-bold)" as any, color: complete ? "var(--pg-d02)" : "var(--text-secondary)" }}>{p.puntosAcumulados} / 30 pts</span>
                  </div>
                  <div className="progress-bar" style={{ height: 6 }}>
                    <div className={`progress-bar__fill ${complete ? "progress-bar__fill--complete" : ""}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="mobile-card__footer">
                   <span className={`badge ${p.disponibilidad === "Disponible" ? "badge--success" : "badge--error"}`} style={{ padding: "4px 8px" }}>
                    {p.disponibilidad}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 300 }}>Participante</th>
                <th style={{ width: 140 }}>Atributos</th>
                <th style={{ width: 140 }}>Hab. Data</th>
                <th style={{ width: 160 }}>Progreso Puntos</th>
                <th style={{ width: 140 }}>Estado</th>
                <th style={{ width: 80, textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const pct = Math.min((p.puntosAcumulados / 30) * 100, 100);
                const complete = p.puntosAcumulados >= 30;
                const incompleteProfile = !p.segmento && !p.producto;
                return (
                  <tr key={p.id} className="row--hover">
                    <td>
                      <div className="data-table__name">
                        <div className="avatar avatar--sm avatar--brand" style={{ width: 40, height: 40 }}>{getInitials(p.nombreCompleto)}</div>
                        <div className="data-table__name-text">
                          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
                            <span className="data-table__name-primary" onClick={() => setSelectedProfile(p)} style={{ fontWeight: "var(--fw-bold)" as any }}>
                              {p.nombreCompleto}
                            </span>
                            {p.esCliente && <i className="fa-solid fa-crown" title="Cliente Skandia" style={{ color: "var(--warning-dark)", fontSize: 10 }} />}
                          </div>
                          <span className="data-table__name-secondary">{p.correo}</span>
                          {p.producto && (
                            <div style={{ fontSize: "10px", color: "var(--text-medium)", display: "flex", alignItems: "center", gap: "var(--space-1)", marginTop: 2 }}>
                              <i className="fa-solid fa-tag" /> {p.producto}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {p.segmento && <span className="badge badge--neutral" style={{ fontSize: 10 }}>{p.segmento}</span>}
                        {p.perfil && <span className="badge badge--info" style={{ fontSize: 10, background: "var(--info-light)", border: "none" }}>{p.perfil}</span>}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${p.consentimiento === "Vigente" ? "badge--success" : p.consentimiento === "Pendiente" ? "badge--warning" : "badge--neutral"}`} style={{ fontSize: 11 }}>
                        {p.consentimiento}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <div className="progress-bar" style={{ height: 6 }}>
                          <div className={`progress-bar__fill ${complete ? "progress-bar__fill--complete" : ""}`} style={{ width: `${pct}%` }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                           <span style={{ fontWeight: "var(--fw-bold)" as any, color: complete ? "var(--pg-d02)" : "var(--text-secondary)" }}>{p.puntosAcumulados} pts</span>
                           {complete && <i className="fa-solid fa-gift" style={{ color: "var(--pg-d02)" }} />}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${p.disponibilidad === "Disponible" ? "badge--success" : "badge--error"}`} style={{ padding: "4px 8px" }}>
                        {p.disponibilidad}
                      </span>
                    </td>
                    <td>
                      <div className="dropdown">
                        <button className="btn btn--ghost btn--icon" onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)} aria-label="Acciones">
                          <i className="fa-solid fa-ellipsis" aria-hidden="true" />
                        </button>
                        {openMenuId === p.id && (
                          <div className="dropdown__menu">
                            <button className="dropdown__item" onClick={() => { setSelectedProfile(p); setOpenMenuId(null); }}>
                              <i className="fa-regular fa-user" aria-hidden="true" /> Ver perfil completo
                            </button>
                            <button className="dropdown__item" onClick={() => { setAddProjectTarget(p); setOpenMenuId(null); }}>
                              <i className="fa-solid fa-folder-plus" aria-hidden="true" /> Agregar a proyecto
                            </button>
                            <button className="dropdown__item" onClick={() => { setSendEmailTarget(p); setOpenMenuId(null); }}>
                              <i className="fa-regular fa-envelope" aria-hidden="true" /> Enviar correo
                            </button>
                            <button className="dropdown__item" onClick={() => { setEditTarget(p); setOpenMenuId(null); }}>
                              <i className="fa-solid fa-pen" aria-hidden="true" /> Editar perfil
                            </button>
                            <div className="dropdown__separator" />
                            <button className="dropdown__item" onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log("Marcar como no contactar:", p.id);
                              setTimeout(() => {
                                if (window.confirm(`¿Marcar a ${p.nombreCompleto} como No contactar?`)) {
                                  marcarNoContactar(p.id);
                                  setOpenMenuId(null);
                                }
                              }, 50);
                            }} style={{ color: "var(--warning-dark)" }}>
                              <i className="fa-solid fa-ban" aria-hidden="true" /> Marcar como "No contactar"
                            </button>
                            <button className="dropdown__item" onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log("Intentando eliminar participante:", p.id);
                              if (window.confirm(`¿Estás seguro de eliminar a ${p.nombreCompleto}? Esta acción no se puede deshacer.`)) {
                                console.log("Confirmado: eliminando participante", p.id);
                                deleteParticipante(p.id);
                                setOpenMenuId(null);
                              }
                            }} style={{ color: "var(--error-dark)" }}>
                              <i className="fa-solid fa-trash" aria-hidden="true" /> Eliminar participante
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showNewModal && (
        <>
          <div className="overlay" onClick={() => setShowNewModal(false)} />
          <NewParticipantModal
            existingEmails={data.map(p => p.correo)}
            onSave={handleAddParticipant}
            onClose={() => setShowNewModal(false)}
          />
        </>
      )}

      {showBulkUpload && (
        <>
          <div className="overlay" onClick={() => setShowBulkUpload(false)} />
          <BulkUploadModal
            existingEmails={data.map(p => p.correo.toLowerCase())}
            onImport={async (csvData: string, updateExisting: boolean) => {
              const result = await importarParticipantes(csvData, updateExisting);
              if (result) {
                toast.success("Importación finalizada", { 
                  description: `Importados: ${result.importados}, Actualizados: ${result.actualizados}, Omitidos: ${result.omitidos}` 
                });
              }
            }}
            onClose={() => setShowBulkUpload(false)}
          />
        </>
      )}

      {editTarget && (
        <>
          <div className="overlay" onClick={() => setEditTarget(null)} />
          <NewParticipantModal
            existingEmails={data.filter(p => p.id !== editTarget.id).map(p => p.correo)}
            onSave={handleAddParticipant}
            onClose={() => setEditTarget(null)}
            initialData={editTarget}
          />
        </>
      )}

      {addProjectTarget && (
        <>
          <div className="overlay" onClick={() => setAddProjectTarget(null)} />
          <div className="modal" style={{ "--modal-width": "400px" } as React.CSSProperties}>
            <div className="modal__header">
              <h3>Agregar a proyecto</h3>
              <button className="btn btn--ghost btn--icon" onClick={() => setAddProjectTarget(null)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="modal__body">
              <p style={{ marginBottom: "var(--space-3)", fontSize: "var(--fs-label)" }}>
                Selecciona el proyecto para <strong>{addProjectTarget.nombreCompleto}</strong>:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                {useAppStore.getState().proyectos.filter(p => p.estado !== "Cerrado").map(proj => (
                  <button 
                    key={proj.id} 
                    className="dropdown__item"
                    onClick={() => {
                      // Usar la lógica de ProjectDetail para agregar
                      const sessionType = proj.tipo === "Test remoto" ? "Test remoto" : "Entrevista";
                      const newHistory = [
                        ...addProjectTarget.historial,
                        { 
                          proyectoId: proj.id, 
                          proyectoNombre: proj.nombre, 
                          fecha: new Date(), 
                          tipo: sessionType, 
                          puntos: 0, 
                          bonoEnviado: false 
                        }
                      ];
                      updateParticipante(addProjectTarget.id, { historial: newHistory });
                      useAppStore.getState().updateProyecto(proj.id, { participantes: proj.participantes + 1 });
                      setAddProjectTarget(null);
                    }}
                  >
                    <i className="fa-solid fa-folder" aria-hidden="true" /> {proj.nombre}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {sendEmailTarget && (
        <>
          <div className="overlay" onClick={() => setSendEmailTarget(null)} />
          <SendInvitationModal
            participant={sendEmailTarget}
            onSend={(data) => {
              const tracking: any = {
                id: `ET${Date.now()}`,
                proyectoId: "GLOBAL",
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
              useAppStore.getState().registrarEnvio(tracking);
              setSendEmailTarget(null);
            }}
            onClose={() => setSendEmailTarget(null)}
          />
        </>
      )}
    </div>
  );
};

export default Participantes;
