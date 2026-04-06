import { useState } from "react";
import type { Participante } from "@/types";

interface Props {
  existingEmails: string[];
  onSave: (p: Participante) => void;
  onClose: () => void;
  initialData?: Participante | null;
}

const NewParticipantModal = ({ existingEmails, onSave, onClose, initialData }: Props) => {
  const [step, setStep] = useState(initialData ? 2 : 1);
  const [form, setForm] = useState({
    nombreCorto: initialData?.nombreCorto || "",
    nombreCompleto: initialData?.nombreCompleto || "",
    correo: initialData?.correo || "",
    celular: initialData?.celular || "",
    esCliente: initialData?.esCliente ?? null,
    edad: initialData?.edad?.toString() || "",
    segmento: initialData?.segmento || "",
    producto: initialData?.producto || "",
    perfil: initialData?.perfil || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const emailExists = existingEmails.includes(form.correo.toLowerCase().trim()) && form.correo.toLowerCase().trim() !== initialData?.correo?.toLowerCase();
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo);

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.nombreCorto.trim()) e.nombreCorto = "Requerido";
    if (!form.nombreCompleto.trim()) e.nombreCompleto = "Requerido";
    if (!form.correo.trim()) e.correo = "Requerido";
    else if (!emailValid) e.correo = "Formato inválido";
    else if (emailExists) e.correo = "Este correo ya existe";
    if (!form.celular.trim()) e.celular = "Requerido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2) setStep(3);
  };

  const handleSave = () => {
    const p: Participante = {
      id: initialData?.id || `P${String(Date.now()).slice(-4)}`,
      nombreCorto: form.nombreCorto.trim(),
      nombreCompleto: form.nombreCompleto.trim(),
      correo: form.correo.trim().toLowerCase(),
      celular: form.celular.trim(),
      esCliente: form.esCliente,
      edad: form.edad ? parseInt(form.edad) : null,
      producto: form.producto || null,
      perfil: (form.perfil || null) as Participante["perfil"],
      segmento: (form.segmento || null) as Participante["segmento"],
      puntosAcumulados: initialData?.puntosAcumulados || 0,
      disponibilidad: initialData?.disponibilidad || "Disponible",
      consentimiento: initialData?.consentimiento || (form.esCliente ? "N/A — cliente" : "Pendiente"),
      etiquetas: initialData?.etiquetas || [],
      historial: initialData?.historial || [],
      fechaUltimaEdicion: new Date(),
      editadoPor: "Ana Ríos",
    };
    onSave(p);
  };

  const stepStatus = (s: number) => s < step ? "done" : s === step ? "active" : "pending";

  return (
    <div className="modal animate-scale-in" style={{ width: 560 }}>
      <div className="modal__header">
        <h3>Nuevo participante</h3>
        <button className="btn btn--ghost btn--icon" onClick={onClose} aria-label="Cerrar">
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>
      </div>

      <div className="stepper">
        {[{ n: 1, label: "Contacto" }, { n: 2, label: "Perfil" }, { n: 3, label: "Confirmar" }].map((s, i) => (
          <div key={s.n} style={{ display: "flex", alignItems: "center" }}>
            <div className="stepper__step">
              <div className={`stepper__circle stepper__circle--${stepStatus(s.n)}`}>
                {stepStatus(s.n) === "done" ? <i className="fa-solid fa-check" aria-hidden="true" /> : s.n}
              </div>
              <span className="stepper__label">{s.label}</span>
            </div>
            {i < 2 && <div className={`stepper__line ${step > s.n ? "stepper__line--done" : ""}`} />}
          </div>
        ))}
      </div>

      <div className="modal__body">
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <div className="input-field">
              <label className="input-field__label">Nombre para correo *</label>
              <span className="input-field__helper">Nombre corto que usamos en los mails</span>
              <input className={`input-field__input ${errors.nombreCorto ? "input-field__input--error" : ""}`}
                value={form.nombreCorto} onChange={e => setForm({ ...form, nombreCorto: e.target.value })} placeholder='Ej: "Juan David"' />
              {errors.nombreCorto && <span style={{ fontSize: "var(--fs-caption)", color: "var(--error-dark)" }}>{errors.nombreCorto}</span>}
            </div>
            <div className="input-field">
              <label className="input-field__label">Nombre completo *</label>
              <input className={`input-field__input ${errors.nombreCompleto ? "input-field__input--error" : ""}`}
                value={form.nombreCompleto} onChange={e => setForm({ ...form, nombreCompleto: e.target.value })} />
              {errors.nombreCompleto && <span style={{ fontSize: "var(--fs-caption)", color: "var(--error-dark)" }}>{errors.nombreCompleto}</span>}
            </div>
            <div className="input-field">
              <label className="input-field__label">Correo electrónico *</label>
              <input className={`input-field__input ${errors.correo ? "input-field__input--error" : ""}`} type="email"
                value={form.correo} onChange={e => setForm({ ...form, correo: e.target.value })} />
              {errors.correo && <span style={{ fontSize: "var(--fs-caption)", color: "var(--error-dark)" }}>{errors.correo}</span>}
              {emailExists && !errors.correo && (
                <div className="info-banner info-banner--warning" style={{ marginTop: "var(--space-2)" }}>
                  Este correo ya existe en la comunidad
                </div>
              )}
            </div>
            <div className="input-field">
              <label className="input-field__label">Celular *</label>
              <input className={`input-field__input ${errors.celular ? "input-field__input--error" : ""}`}
                value={form.celular} onChange={e => setForm({ ...form, celular: e.target.value })} />
              {errors.celular && <span style={{ fontSize: "var(--fs-caption)", color: "var(--error-dark)" }}>{errors.celular}</span>}
            </div>
            <div className="input-field">
              <label className="input-field__label">¿Es cliente Skandia?</label>
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                {([{ l: "Sí", v: true }, { l: "No", v: false }, { l: "No sé", v: null }] as const).map(o => (
                  <button key={o.l} className={`chip ${form.esCliente === o.v ? "chip--active" : ""}`} onClick={() => setForm({ ...form, esCliente: o.v })}>
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <div className="info-banner info-banner--info">
              <i className="fa-regular fa-circle-info" aria-hidden="true" />
              Estos campos son opcionales. Puedes agregarlos ahora o completarlos después cuando recibas información del aliado.
            </div>
            <div className="input-field">
              <label className="input-field__label">Edad</label>
              <input className="input-field__input" type="number" value={form.edad} onChange={e => setForm({ ...form, edad: e.target.value })} />
            </div>
            <div className="input-field">
              <label className="input-field__label">Segmento</label>
              <select className="input-field__input select-field" value={form.segmento} onChange={e => setForm({ ...form, segmento: e.target.value })}>
                <option value="">Seleccionar...</option>
                {["Finanzas Personales", "Elite", "Privilegio", "Wealth", "Corporativo"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="input-field">
              <label className="input-field__label">Producto</label>
              <select className="input-field__input select-field" value={form.producto} onChange={e => setForm({ ...form, producto: e.target.value })}>
                <option value="">Seleccionar...</option>
                {["MFUND", "FIC", "FPOB", "Seguros", "Otro"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="input-field">
              <label className="input-field__label">Perfil de inversión</label>
              <select className="input-field__input select-field" value={form.perfil} onChange={e => setForm({ ...form, perfil: e.target.value })}>
                <option value="">Seleccionar...</option>
                {["Conservador", "Moderado", "Arriesgado", "Empowered"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <h4>Resumen</h4>
            <div className="data-grid">
              <div className="data-grid__item"><label>Nombre corto</label><span>{form.nombreCorto}</span></div>
              <div className="data-grid__item"><label>Nombre completo</label><span>{form.nombreCompleto}</span></div>
              <div className="data-grid__item"><label>Correo</label><span>{form.correo}</span></div>
              <div className="data-grid__item"><label>Celular</label><span>{form.celular}</span></div>
              <div className="data-grid__item"><label>Cliente</label><span>{form.esCliente === null ? "No sé" : form.esCliente ? "Sí" : "No"}</span></div>
              <div className="data-grid__item"><label>Edad</label>{form.edad ? <span>{form.edad}</span> : <span className="text-null">Sin dato</span>}</div>
              <div className="data-grid__item"><label>Segmento</label>{form.segmento ? <span>{form.segmento}</span> : <span className="text-null">Sin dato</span>}</div>
              <div className="data-grid__item"><label>Producto</label>{form.producto ? <span>{form.producto}</span> : <span className="text-null">Sin dato</span>}</div>
              <div className="data-grid__item"><label>Perfil</label>{form.perfil ? <span>{form.perfil}</span> : <span className="text-null">Sin dato</span>}</div>
            </div>
            {(!form.segmento || !form.producto || !form.perfil) && (
              <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)" }}>
                Podrás completar estos datos más adelante
              </div>
            )}
          </div>
        )}
      </div>

      <div className="modal__footer">
        {step > 1 && <button className="btn btn--secondary" onClick={() => setStep(step - 1)}>Atrás</button>}
        {step < 3 ? (
          <button className="btn btn--primary" onClick={handleNext}>Siguiente</button>
        ) : (
          <button className="btn btn--primary" onClick={handleSave}>Guardar participante</button>
        )}
      </div>
    </div>
  );
};

export default NewParticipantModal;
