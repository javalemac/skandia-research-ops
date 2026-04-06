import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import type { Participante, Plantilla, Proyecto } from "@/types";

interface Props {
  project?: Proyecto | null;
  participant?: Participante | null;
  onSend: (data: { participante: Participante; plantilla: Plantilla; variables: Record<string, string> }) => void;
  onClose: () => void;
}

const SendInvitationModal = ({ project, participant, onSend, onClose }: Props) => {
  const plantillas = useAppStore(state => state.plantillas);
  const allParticipantes = useAppStore(state => state.participantes);
  const [step, setStep] = useState<1 | 2 | 3>(participant ? 2 : 1);
  const [selectedParticipant, setSelectedParticipant] = useState<Participante | null>(participant ?? null);
  const [selectedTemplate, setSelectedTemplate] = useState<Plantilla | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState("");

  const availableParticipants = project
    ? allParticipantes.filter(p => p.historial.some(h => h.proyectoId === project.id))
    : allParticipantes;

  const filtered = availableParticipants.filter(p =>
    p.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.correo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();

  const handleSelectTemplate = (t: Plantilla) => {
    setSelectedTemplate(t);
    const vars: Record<string, string> = {};
    const pointsToAdd = project?.tipo === "Test remoto" ? "10" : "15";

    t.variables.forEach(v => {
      const vLower = v.toLowerCase();
      if (vLower === "nombre" && selectedParticipant) {
        vars[v] = selectedParticipant.nombreCorto;
      } else if (vLower === "puntos") {
        vars[v] = pointsToAdd;
      } else if (vLower === "puntosacumulados" && selectedParticipant) {
        vars[v] = String(selectedParticipant.puntosAcumulados);
      } else if (vLower === "puntasfaltantes" && selectedParticipant) {
        vars[v] = String(Math.max(0, 30 - selectedParticipant.puntosAcumulados));
      } else if (vLower === "puntosactuales" && selectedParticipant) {
        vars[v] = String(selectedParticipant.puntosAcumulados);
      } else if (vLower === "descripción" && project) {
        vars[v] = project.nombre;
      } else if (vLower === "nombrediseñador") {
        vars[v] = "Ana Ríos"; // Usuario por defecto del MVP
      } else if (vLower === "enlace teams" && project?.enlace) {
        vars[v] = project.enlace;
      } else {
        vars[v] = "";
      }
    });
    setVariables(vars);
    setStep(3);
  };

  const handleSend = () => {
    if (selectedParticipant && selectedTemplate) {
      onSend({ participante: selectedParticipant, plantilla: selectedTemplate, variables });
    }
  };

  const previewBody = selectedTemplate
    ? selectedTemplate.cuerpo.replace(/\[([^\]]+)\]/g, (_, key) => variables[key] || `[${key}]`)
    : "";

  const isFormValid = selectedTemplate?.variables.every(v => variables[v] && variables[v].trim() !== "");

  return (
    <div className="modal animate-scale-in" style={{ width: 800 }}>
      <div className="modal__header">
        <h3>Enviar invitación</h3>
        <button className="btn btn--ghost btn--icon" onClick={onClose} aria-label="Cerrar">
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>
      </div>

      {/* Stepper */}
      <div className="stepper">
        <div className="stepper__step">
          <div className={`stepper__circle ${step > 1 ? "stepper__circle--done" : "stepper__circle--active"}`}>
            {step > 1 ? <i className="fa-solid fa-check" style={{ fontSize: 12 }} /> : "1"}
          </div>
          <span className="stepper__label">Destinatario</span>
        </div>
        <div className={`stepper__line ${step > 1 ? "stepper__line--done" : ""}`} />
        <div className="stepper__step">
          <div className={`stepper__circle ${step > 2 ? "stepper__circle--done" : step === 2 ? "stepper__circle--active" : "stepper__circle--pending"}`}>
            {step > 2 ? <i className="fa-solid fa-check" style={{ fontSize: 12 }} /> : "2"}
          </div>
          <span className="stepper__label">Plantilla</span>
        </div>
        <div className={`stepper__line ${step > 2 ? "stepper__line--done" : ""}`} />
        <div className="stepper__step">
          <div className={`stepper__circle ${step === 3 ? "stepper__circle--active" : "stepper__circle--pending"}`}>3</div>
          <span className="stepper__label">Revisar y enviar</span>
        </div>
      </div>

      <div className="modal__body" style={{ minHeight: 300 }}>
        {/* Step 1: Select participant */}
        {step === 1 && (
          <div>
            <div className="search-box" style={{ width: "100%", marginBottom: "var(--space-3)" }}>
              <i className="fa-solid fa-magnifying-glass search-box__icon" aria-hidden="true" />
              <input
                className="input-field__input"
                placeholder="Buscar participante..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: "100%", paddingLeft: "var(--space-6)" }}
              />
            </div>
            <div style={{ maxHeight: 240, overflowY: "auto", display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
              {filtered.map(p => (
                <button
                  key={p.id}
                  className="dropdown__item"
                  style={{ borderRadius: "var(--radius-sm)", padding: "var(--space-2) var(--space-3)" }}
                  onClick={() => { setSelectedParticipant(p); setStep(2); }}
                >
                  <div className="avatar avatar--sm avatar--brand">{getInitials(p.nombreCompleto)}</div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: "var(--fw-medium)" as any, fontSize: "var(--fs-label)" }}>{p.nombreCompleto}</span>
                    <span style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)" }}>{p.correo}</span>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "var(--fs-label)", padding: "var(--space-4)" }}>
                  No se encontraron participantes
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Select template */}
        {step === 2 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-3)", padding: "var(--space-2) var(--space-3)", background: "var(--pg-l05)", borderRadius: "var(--radius-sm)" }}>
              <div className="avatar avatar--sm avatar--brand">{getInitials(selectedParticipant!.nombreCompleto)}</div>
              <div>
                <span style={{ fontWeight: "var(--fw-medium)" as any, fontSize: "var(--fs-label)" }}>{selectedParticipant!.nombreCompleto}</span>
                <span style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)", marginLeft: "var(--space-2)" }}>{selectedParticipant!.correo}</span>
              </div>
              {!participant && (
                <button className="btn btn--ghost btn--icon" onClick={() => setStep(1)} style={{ marginLeft: "auto" }} aria-label="Cambiar">
                  <i className="fa-solid fa-pen" aria-hidden="true" style={{ fontSize: "var(--fs-caption)" }} />
                </button>
              )}
            </div>
            <div style={{ fontSize: "var(--fs-caption)", fontWeight: "var(--fw-bold)" as any, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--space-2)" }}>
              Selecciona una plantilla
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", maxHeight: 240, overflowY: "auto" }}>
              {plantillas.map(t => (
                <button
                  key={t.id}
                  className="dropdown__item"
                  style={{ borderRadius: "var(--radius-sm)", padding: "var(--space-2) var(--space-3)", flexDirection: "column", alignItems: "flex-start" }}
                  onClick={() => handleSelectTemplate(t)}
                >
                  <span style={{ fontWeight: "var(--fw-medium)" as any, fontSize: "var(--fs-label)" }}>
                    <span style={{ color: "var(--text-secondary)" }}>{t.codigo}</span> · {t.nombre}
                  </span>
                  <span style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)" }}>{t.descripcion}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Review & send */}
        {step === 3 && selectedTemplate && selectedParticipant && (
          <div>
            {/* Recipient summary */}
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-3)", padding: "var(--space-2) var(--space-3)", background: "var(--pg-l05)", borderRadius: "var(--radius-sm)" }}>
              <div className="avatar avatar--sm avatar--brand">{getInitials(selectedParticipant.nombreCompleto)}</div>
              <div>
                <span style={{ fontWeight: "var(--fw-medium)" as any, fontSize: "var(--fs-label)" }}>{selectedParticipant.nombreCompleto}</span>
                <span style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)", marginLeft: "var(--space-2)" }}>{selectedParticipant.correo}</span>
              </div>
            </div>

            {/* Template info */}
            <div style={{ marginBottom: "var(--space-3)" }}>
              <div style={{ fontSize: "var(--fs-caption)", fontWeight: "var(--fw-bold)" as any, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--space-1)" }}>
                Plantilla
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                <span style={{ fontSize: "var(--fs-label)", fontWeight: "var(--fw-medium)" as any }}>{selectedTemplate.codigo} · {selectedTemplate.nombre}</span>
                <button className="btn btn--ghost" onClick={() => setStep(2)} style={{ fontSize: "var(--fs-caption)", height: 24, padding: "0 var(--space-2)" }}>
                  Cambiar
                </button>
              </div>
            </div>

            {/* Variables */}
            {selectedTemplate.variables.length > 0 && (
              <div style={{ marginBottom: "var(--space-3)" }}>
                <div style={{ fontSize: "var(--fs-caption)", fontWeight: "var(--fw-bold)" as any, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--space-2)" }}>
                  Variables
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
                  {selectedTemplate.variables.map(v => (
                    <div className="input-field" key={v}>
                      <label className="input-field__label">[{v}]</label>
                      <input
                        className="input-field__input"
                        value={variables[v] || ""}
                        onChange={e => setVariables(prev => ({ ...prev, [v]: e.target.value }))}
                        placeholder={`Valor de ${v}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preview View */}
            <div>
              <div style={{ fontSize: "var(--fs-caption)", fontWeight: "var(--fw-bold)" as any, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--space-2)" }}>
                Vista previa completa
              </div>
              <div style={{ border: "1px solid var(--neutral-l03)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                  {/* Email Client Header */}
                  <div style={{ background: "var(--neutral-l01)", padding: "var(--space-3)", borderBottom: "1px solid var(--neutral-l03)" }}>
                    <div style={{ fontSize: "var(--fs-label)", color: "var(--text-secondary)", marginBottom: "var(--space-1)" }}>
                      De: <strong>Skandia Reclutamiento &lt;noreply@skandia.com.co&gt;</strong>
                    </div>
                    <div style={{ fontSize: "var(--fs-label)", color: "var(--text-secondary)", marginBottom: "var(--space-1)" }}>
                      Para: <strong>{selectedParticipant.correo}</strong>
                    </div>
                    <div style={{ fontSize: "var(--fs-caption)", fontWeight: "var(--fw-bold)" as any }}>
                      Asunto: {selectedTemplate.asunto.replace(/\[([^\]]+)\]/g, (_, key) => variables[key] || `[${key}]`)}
                    </div>
                  </div>
                  {/* Email Body Preview (Simulating HTML Template) */}
                  <div style={{ background: "#eaeef1", padding: "var(--space-5)" }}>
                     <div style={{ background: "#ffffff", borderRadius: "12px", maxWidth: "600px", margin: "0 auto", overflow: "hidden", fontFamily: "'Open Sans', Arial, sans-serif" }}>
                        <div style={{ padding: "var(--space-5)", textAlign: "center" }}>
                           <img 
                             src="https://contigo.skandia.co/documents/830689/1667899/skandia1.png/38108a1f-483b-74fc-76b4-4d6598f28af0?t=1725984348801" 
                             alt="Skandia" 
                             style={{ height: 40, marginBottom: "var(--space-4)" }} 
                           />
                           <h1 style={{ color: "#3f3f3f", fontSize: "28px", fontWeight: "normal", margin: "0 0 var(--space-4) 0" }}>
                              ¡Hola {variables['Nombre'] || selectedParticipant.nombreCorto}!
                           </h1>
                           <div style={{ color: "#3f3f3f", fontSize: "14px", lineHeight: "1.6", textAlign: "left" }}>
                             <p dangerouslySetInnerHTML={{ __html: previewBody.replace(/\n/g, '<br/>') }} />
                           </div>
                           <div style={{ marginTop: "var(--space-5)", background: "#00df65", padding: "var(--space-4)", borderRadius: "12px", textAlign: "center", color: "#3f3f3f" }}>
                             <h2 style={{ margin: "0 0 8px 0", fontSize: "24px" }}>¡Gracias por colaborar!</h2>
                             <p style={{ margin: 0, fontSize: "12px" }}>Si tienes dudas, contáctanos a cx@skandia.com.co</p>
                           </div>
                        </div>
                     </div>
                  </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="modal__footer">
        {step > 1 && (
          <button className="btn btn--secondary" onClick={() => setStep((step - 1) as 1 | 2)}>
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Atrás
          </button>
        )}
        <button className="btn btn--secondary" onClick={onClose}>Cancelar</button>
        {step === 3 && (
          <button 
            className="btn btn--primary" 
            onClick={handleSend}
            disabled={!isFormValid}
            style={{ opacity: isFormValid ? 1 : 0.5, cursor: isFormValid ? "pointer" : "not-allowed" }}
          >
            <i className="fa-solid fa-paper-plane" aria-hidden="true" /> Enviar
          </button>
        )}
      </div>
    </div>
  );
};

export default SendInvitationModal;
