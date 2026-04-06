import { useState } from "react";
import type { Proyecto } from "@/types";

interface Props {
  initialData?: Proyecto;
  onSave: (p: Proyecto) => void;
  onClose: () => void;
}

const tipos = [
  "Test remoto (UseBerry/Maze)",
  "Entrevista virtual (Teams)",
  "Entrevista presencial",
  "Encuesta",
  "Diario de campo",
];

const responsables = [
  "Ana Ríos",
  "Carlos Muñoz",
  "María López",
  "Javier Alemán",
  "Sebastián Oyola",
];

const segmentos = ["Finanzas Personales", "Elite", "Privilegio", "Wealth", "Corporativo"];

const NewProjectModal = ({ initialData, onSave, onClose }: Props) => {
  const isEdit = !!initialData;
  const [nombre, setNombre] = useState(initialData?.nombre || "");
  const [tipo, setTipo] = useState(initialData?.tipo || "");
  const [objetivo, setObjetivo] = useState(initialData?.objetivo || "");
  const [responsable, setResponsable] = useState(initialData?.responsable || "");
  const [inicio, setInicio] = useState(initialData?.inicio || "");
  const [fin, setFin] = useState(initialData?.fin || "");
  const [enlace, setEnlace] = useState(initialData?.enlace || "");
  // Asumiendo 10 puntos por defecto si no está en inicial, pero podríamos guardarlo
  const [puntos, setPuntos] = useState<number>(10);
  const [cuotas, setCuotas] = useState<Record<string, number>>(
    Object.fromEntries(segmentos.map(s => [s, initialData ? Math.floor(initialData.cuota / segmentos.length) : 0]))
  );

  const totalCuota = Object.values(cuotas).reduce((a, b) => a + b, 0);
  const valid = nombre.trim() && tipo && responsable && inicio && fin && totalCuota > 0;

  const handleSave = () => {
    if (!valid) return;
    const id = isEdit ? initialData.id : `PR${String(Date.now()).slice(-3)}`;
    onSave({
      id,
      nombre: nombre.trim(),
      tipo,
      estado: isEdit ? initialData.estado : "Planeando",
      participantes: isEdit ? initialData.participantes : 0,
      cuota: totalCuota,
      responsable,
      inicio,
      fin,
      objetivo: objetivo.trim() || undefined,
      enlace: enlace.trim() || undefined,
      links: isEdit ? initialData.links : [],
    });
  };

  return (
    <div className="modal animate-scale-in" style={{ width: 600 }}>
      <div className="modal__header">
        <h3>{isEdit ? "Editar proyecto" : "Nuevo proyecto"}</h3>
        <button className="btn btn--ghost btn--icon" onClick={onClose} aria-label="Cerrar">
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>
      </div>
      <div className="modal__body" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <div className="input-field">
          <label className="input-field__label">Nombre del estudio *</label>
          <input className="input-field__input" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: App Pensiones V3" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
          <div className="input-field">
            <label className="input-field__label">Tipo *</label>
            <select className="select-field" value={tipo} onChange={e => setTipo(e.target.value)} style={{ width: "100%" }}>
              <option value="">Seleccionar...</option>
              {tipos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="input-field">
            <label className="input-field__label">Diseñador responsable *</label>
            <select className="select-field" value={responsable} onChange={e => setResponsable(e.target.value)} style={{ width: "100%" }}>
              <option value="">Seleccionar...</option>
              {responsables.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div className="input-field">
          <label className="input-field__label">Objetivo de la investigación</label>
          <textarea
            className="input-field__input"
            value={objetivo}
            onChange={e => setObjetivo(e.target.value)}
            placeholder="Describe el objetivo principal del estudio..."
            style={{ minHeight: 80, padding: "var(--space-2) var(--space-3)", resize: "vertical" }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
          <div className="input-field">
            <label className="input-field__label">Fecha inicio *</label>
            <input className="input-field__input" type="date" value={inicio} onChange={e => setInicio(e.target.value)} />
          </div>
          <div className="input-field">
            <label className="input-field__label">Fecha fin *</label>
            <input className="input-field__input" type="date" value={fin} onChange={e => setFin(e.target.value)} />
          </div>
        </div>

        <div className="input-field">
          <label className="input-field__label">Cuotas por segmento *</label>
          <span className="input-field__helper">Define cuántos participantes necesitas por segmento</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
            {segmentos.map(s => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                <label style={{ flex: 1, fontSize: "var(--fs-caption)", color: "var(--text-secondary)" }}>{s}</label>
                <input
                  className="input-field__input"
                  type="number"
                  min={0}
                  value={cuotas[s]}
                  onChange={e => setCuotas(prev => ({ ...prev, [s]: Math.max(0, parseInt(e.target.value) || 0) }))}
                  style={{ width: 64, textAlign: "center" }}
                />
              </div>
            ))}
          </div>
          <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)", marginTop: "var(--space-2)", textAlign: "right" }}>
            Total: <strong style={{ color: "var(--text-primary)" }}>{totalCuota}</strong> participantes
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
          <div className="input-field">
            <label className="input-field__label">Puntos de la actividad</label>
            <span className="input-field__helper">Cuántos puntos suma este estudio al participante</span>
            <input className="input-field__input" type="number" min={0} value={puntos} onChange={e => setPuntos(Math.max(0, parseInt(e.target.value) || 0))} />
          </div>
          <div className="input-field">
            <label className="input-field__label">Enlace del test o sesión</label>
            <input className="input-field__input" type="url" value={enlace} onChange={e => setEnlace(e.target.value)} placeholder="https://..." />
          </div>
        </div>
      </div>
      <div className="modal__footer">
        <button className="btn btn--secondary" onClick={onClose}>Cancelar</button>
        <button className="btn btn--primary" onClick={handleSave} disabled={!valid} style={{ opacity: valid ? 1 : 0.5 }}>
          {isEdit ? "Guardar cambios" : "Crear proyecto"}
        </button>
      </div>
    </div>
  );
};

export default NewProjectModal;
