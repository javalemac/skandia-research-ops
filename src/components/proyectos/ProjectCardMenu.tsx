import { useState, useRef, useEffect } from "react";
import type { Proyecto } from "@/types";

interface Props {
  project: Proyecto;
  onEdit: (p: Proyecto) => void;
  onDuplicate: (p: Proyecto) => void;
  onClose: (p: Proyecto) => void;
  onDelete: (p: Proyecto) => void;
  onSendInvitation: (p: Proyecto) => void;
}

const ProjectCardMenu = ({ project, onEdit, onDuplicate, onClose, onDelete, onSendInvitation }: Props) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handle = (fn: (p: Proyecto) => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    fn(project);
  };

  return (
    <div className="dropdown" ref={ref}>
      <button
        className="btn btn--ghost btn--icon"
        aria-label="Más opciones"
        onClick={e => { e.stopPropagation(); setOpen(!open); }}
      >
        <i className="fa-solid fa-ellipsis" aria-hidden="true" />
      </button>
      {open && (
        <div className="dropdown__menu">
          <button className="dropdown__item" onClick={handle(onEdit)}>
            <i className="fa-solid fa-pen" aria-hidden="true" style={{ width: 16, textAlign: "center", color: "var(--text-secondary)" }} />
            Editar proyecto
          </button>
          <button className="dropdown__item" onClick={handle(onSendInvitation)}>
            <i className="fa-solid fa-envelope" aria-hidden="true" style={{ width: 16, textAlign: "center", color: "var(--text-secondary)" }} />
            Enviar invitación
          </button>
          <button className="dropdown__item" onClick={handle(onDuplicate)}>
            <i className="fa-solid fa-copy" aria-hidden="true" style={{ width: 16, textAlign: "center", color: "var(--text-secondary)" }} />
            Duplicar proyecto
          </button>
          <div className="dropdown__separator" />
          {project.estado !== "Cerrado" ? (
            <button className="dropdown__item" onClick={handle(onClose)}>
              <i className="fa-solid fa-lock" aria-hidden="true" style={{ width: 16, textAlign: "center", color: "var(--text-secondary)" }} />
              Cerrar proyecto
            </button>
          ) : (
            <button className="dropdown__item" onClick={handle(onClose)}>
              <i className="fa-solid fa-lock-open" aria-hidden="true" style={{ width: 16, textAlign: "center", color: "var(--text-secondary)" }} />
              Reabrir proyecto
            </button>
          )}
          <div className="dropdown__separator" />
          <button className="dropdown__item" onClick={handle(onDelete)} style={{ color: "var(--error-dark)" }}>
            <i className="fa-solid fa-trash" aria-hidden="true" style={{ width: 16, textAlign: "center" }} />
            Eliminar proyecto
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectCardMenu;
