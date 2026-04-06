import { useState, useMemo } from "react";
import { useAppStore } from "@/store/appStore";
import type { Participante, Proyecto } from "@/types";

interface Props {
  project: Proyecto;
  onAdd: (participant: Participante) => void;
  onClose: () => void;
}

const AddParticipantToProject = ({ project, onAdd, onClose }: Props) => {
  const allParticipantes = useAppStore(state => state.participantes);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const alreadyAssigned = useMemo(() => {
    return new Set(allParticipantes.filter(p => p.historial.some(h => h.proyectoId === project.id)).map(p => p.id));
  }, [project.id]);

  const available = useMemo(() => {
    return allParticipantes.filter(p => {
      if (alreadyAssigned.has(p.id)) return false;
      if (p.disponibilidad === "No contactar") return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.nombreCompleto.toLowerCase().includes(q) && !p.correo.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [search, alreadyAssigned]);

  const getInitials = (name: string) => name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();

  const selected = available.find(p => p.id === selectedId);

  return (
    <div className="modal" style={{ width: 560 }}>
      <div className="modal__header">
        <h3>Agregar participante a {project.nombre}</h3>
        <button className="btn btn--ghost btn--icon" onClick={onClose} aria-label="Cerrar">
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>
      </div>
      <div className="modal__body" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <div className="search-box" style={{ width: "100%" }}>
          <i className="fa-solid fa-magnifying-glass search-box__icon" aria-hidden="true" />
          <input
            className="input-field__input"
            placeholder="Buscar participante por nombre o correo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", paddingLeft: "var(--space-6)" }}
          />
        </div>

        <div style={{ maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          {available.length === 0 ? (
            <div className="empty-state" style={{ padding: "var(--space-4)" }}>
              <i className="fa-solid fa-users" aria-hidden="true" style={{ fontSize: 32 }} />
              <p>No hay participantes disponibles</p>
            </div>
          ) : (
            available.map(p => (
              <div
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                  padding: "var(--space-2) var(--space-3)",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  border: selectedId === p.id ? "2px solid var(--pg-00)" : "2px solid transparent",
                  background: selectedId === p.id ? "var(--pg-l05)" : "transparent",
                  transition: "all 150ms ease",
                }}
              >
                <div className="avatar avatar--sm avatar--brand">{getInitials(p.nombreCompleto)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "var(--fs-label)", fontWeight: "var(--fw-medium)" }}>{p.nombreCompleto}</div>
                  <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)" }}>{p.correo}</div>
                </div>
                <span className={`badge ${p.disponibilidad === "Disponible" ? "badge--success" : "badge--warning"}`}>
                  {p.disponibilidad}
                </span>
                {p.segmento && <span className="badge badge--neutral">{p.segmento}</span>}
              </div>
            ))
          )}
        </div>

        {selected && (
          <div className="info-banner info-banner--info">
            <i className="fa-solid fa-circle-info" aria-hidden="true" />
            <span><strong>{selected.nombreCorto}</strong> tiene {selected.puntosAcumulados} puntos acumulados y {selected.historial.length} sesiones previas.</span>
          </div>
        )}
      </div>
      <div className="modal__footer">
        <button className="btn btn--secondary" onClick={onClose}>Cancelar</button>
        <button
          className="btn btn--primary"
          disabled={!selected}
          style={{ opacity: selected ? 1 : 0.5 }}
          onClick={() => selected && onAdd(selected)}
        >
          <i className="fa-solid fa-user-plus" aria-hidden="true" /> Agregar al proyecto
        </button>
      </div>
    </div>
  );
};

export default AddParticipantToProject;
