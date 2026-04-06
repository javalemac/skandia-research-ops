import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import type { Proyecto } from "@/types";
import NewProjectModal from "@/components/proyectos/NewProjectModal";
import ProjectDetail from "@/components/proyectos/ProjectDetail";
import ProjectCardMenu from "@/components/proyectos/ProjectCardMenu";
import SendInvitationModal from "@/components/proyectos/SendInvitationModal";

const ESTADOS = ["Todos", "En campo", "Reclutando", "Planeando", "Cerrado"] as const;
const TIPOS = ["Todos", "Entrevista virtual", "Test remoto", "Encuesta"] as const;

const Proyectos = () => {
  const proyectos = useAppStore(state => state.proyectos);
  const addProyecto = useAppStore(state => state.addProyecto);
  const updateProyecto = useAppStore(state => state.updateProyecto);
  const deleteProyecto = useAppStore(state => state.deleteProyecto);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Proyecto | null>(null);
  const [filterEstado, setFilterEstado] = useState<string>("Todos");
  const [filterTipo, setFilterTipo] = useState<string>("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [invitationProject, setInvitationProject] = useState<Proyecto | null>(null);
  const [editProject, setEditProject] = useState<Proyecto | null>(null);

  const estadoBadge = (estado: string) => {
    switch (estado) {
      case "En campo": return "badge--brand";
      case "Reclutando": return "badge--info";
      case "Planeando": return "badge--neutral";
      case "Cerrado": return "badge--neutral";
      default: return "badge--neutral";
    }
  };

  const handleAddProject = (p: Proyecto) => {
    addProyecto(p);
    setShowNewModal(false);
  };

  const handleEditProject = (p: Proyecto) => {
    updateProyecto(p.id, p);
    setEditProject(null);
  };

  const handleDuplicate = (p: Proyecto) => {
    const dup: Proyecto = {
      ...p,
      id: `PR${Date.now()}`,
      nombre: `${p.nombre} (copia)`,
      estado: "Planeando",
      participantes: 0,
    };
    addProyecto(dup);
  };

  const handleToggleClose = (p: Proyecto) => {
    updateProyecto(p.id, { 
      estado: p.estado === "Cerrado" ? "Planeando" : "Cerrado" 
    });
  };

  const handleDelete = (p: Proyecto) => {
    console.log("Intentando eliminar proyecto:", p.id);
    // Un pequeño delay previene que el confirm bloquee el cierre del menú dropdown
    setTimeout(() => {
      if (window.confirm(`¿Estás seguro de eliminar el proyecto "${p.nombre}"?`)) {
        console.log("Confirmado: eliminando proyecto", p.id);
        deleteProyecto(p.id);
      }
    }, 50);
  };

  const handleSendInvitation = (_data: any) => {
    setInvitationProject(null);
  };

  const filtered = proyectos.filter(p => {
    if (filterEstado !== "Todos" && p.estado !== filterEstado) return false;
    if (filterTipo !== "Todos" && p.tipo !== filterTipo) return false;
    if (searchTerm && !p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) && !p.responsable.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const activeFilters = (filterEstado !== "Todos" ? 1 : 0) + (filterTipo !== "Todos" ? 1 : 0);

  if (selectedProject) {
    return <ProjectDetail project={selectedProject} onBack={() => setSelectedProject(null)} />;
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header__left">
          <h1>Proyectos ({filtered.length})</h1>
        </div>
        <div className="page-header__right">
          <div className="search-box">
            <i className="fa-solid fa-magnifying-glass search-box__icon" aria-hidden="true" />
            <input
              className="input-field__input"
              placeholder="Buscar proyecto…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: "100%", paddingLeft: "var(--space-6)" }}
            />
            {searchTerm && (
              <button className="search-box__clear" onClick={() => setSearchTerm("")}>
                <i className="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            )}
          </div>
          <button
            className={`btn ${showFilters ? "btn--primary" : "btn--secondary"}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <i className="fa-solid fa-filter" aria-hidden="true" />
            Filtros {activeFilters > 0 && <span className="badge badge--brand" style={{ marginLeft: 4, height: 18, minWidth: 18, fontSize: 10 }}>{activeFilters}</span>}
          </button>
          <button className="btn btn--primary" onClick={() => setShowNewModal(true)}>
            <i className="fa-solid fa-plus" aria-hidden="true" /> Nuevo proyecto
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="filters-panel">
          <div style={{ display: "flex", gap: "var(--space-5)", alignItems: "flex-start" }}>
            <div className="filters-panel__group" style={{ flex: 1 }}>
              <div className="filters-panel__group-label">Estado</div>
              <div className="filters-panel__chips">
                {ESTADOS.map(e => (
                  <button key={e} className={`chip ${filterEstado === e ? "chip--active" : ""}`} onClick={() => setFilterEstado(e)}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div className="filters-panel__group" style={{ flex: 1 }}>
              <div className="filters-panel__group-label">Tipo</div>
              <div className="filters-panel__chips">
                {TIPOS.map(t => (
                  <button key={t} className={`chip ${filterTipo === t ? "chip--active" : ""}`} onClick={() => setFilterTipo(t)}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {activeFilters > 0 && (
            <div style={{ marginTop: "var(--space-3)", display: "flex", justifyContent: "flex-end" }}>
              <button className="btn btn--ghost" onClick={() => { setFilterEstado("Todos"); setFilterTipo("Todos"); }} style={{ fontSize: "var(--fs-caption)" }}>
                <i className="fa-solid fa-xmark" aria-hidden="true" /> Limpiar filtros
              </button>
            </div>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <i className="fa-solid fa-folder-open" aria-hidden="true" />
          <p>No se encontraron proyectos con los filtros aplicados</p>
          <button className="btn btn--secondary" onClick={() => { setFilterEstado("Todos"); setFilterTipo("Todos"); setSearchTerm(""); }}>
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="project-grid">
          {filtered.map(p => {
            const pct = Math.round((p.participantes / p.cuota) * 100);
            return (
              <div key={p.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", cursor: "pointer" }} onClick={() => setSelectedProject(p)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className={`badge ${estadoBadge(p.estado)}`}>
                    {p.estado === "En campo" && <span style={{ marginRight: "var(--space-1)" }}>●</span>}
                    {p.estado}
                  </span>
                  <ProjectCardMenu
                    project={p}
                    onEdit={setEditProject}
                    onDuplicate={handleDuplicate}
                    onClose={handleToggleClose}
                    onDelete={handleDelete}
                    onSendInvitation={setInvitationProject}
                  />
                </div>
                <div>
                  <h3 style={{ fontSize: "var(--fs-h4)", marginBottom: "var(--space-1)", textDecoration: p.estado === "Cerrado" ? "line-through" : "none" }}>{p.nombre}</h3>
                  <div style={{ fontSize: "var(--fs-label)", color: "var(--text-secondary)" }}>{p.tipo}</div>
                </div>
                <div>
                  <div style={{ fontSize: "var(--fs-label)", marginBottom: "var(--space-2)" }}>
                    {p.participantes} / {p.cuota} participantes
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar__track">
                      <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="progress-bar__label">{pct}%</span>
                  </div>
                </div>
                <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)", display: "flex", justifyContent: "space-between" }}>
                  <span>{p.responsable}</span>
                  <span>Campo: {p.inicio} — {p.fin}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showNewModal && (
        <>
          <div className="overlay" onClick={() => setShowNewModal(false)} />
          <NewProjectModal onSave={handleAddProject} onClose={() => setShowNewModal(false)} />
        </>
      )}

      {editProject && (
        <>
          <div className="overlay" onClick={() => setEditProject(null)} />
          <NewProjectModal initialData={editProject} onSave={handleEditProject} onClose={() => setEditProject(null)} />
        </>
      )}

      {invitationProject && (
        <>
          <div className="overlay" onClick={() => setInvitationProject(null)} />
          <SendInvitationModal project={invitationProject} onSend={handleSendInvitation} onClose={() => setInvitationProject(null)} />
        </>
      )}
    </div>
  );
};

export default Proyectos;
