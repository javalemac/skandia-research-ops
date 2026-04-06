import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import type { Participante, Proyecto } from "@/types";

interface Props {
  participant: Participante;
  project: Proyecto;
  onSend: (bonoCode: string) => void;
  onClose: () => void;
}

const SendBonoModal = ({ participant, project, onSend, onClose }: Props) => {
  const allBonos = useAppStore(state => state.bonos);
  const disponibles = allBonos.filter(b => b.estado === "Disponible");
  const [selectedBono, setSelectedBono] = useState(disponibles[0]?.codigo || "");

  const getInitials = (name: string) => name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();

  return (
    <div className="modal" style={{ width: 520 }}>
      <div className="modal__header">
        <h3>Enviar bono</h3>
        <button className="btn btn--ghost btn--icon" onClick={onClose} aria-label="Cerrar">
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>
      </div>
      <div className="modal__body" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {/* Participant info */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3)", background: "var(--neutral-l02)", borderRadius: "var(--radius-sm)" }}>
          <div className="avatar avatar--md avatar--brand">{getInitials(participant.nombreCompleto)}</div>
          <div>
            <div style={{ fontSize: "var(--fs-label)", fontWeight: "var(--fw-medium)" }}>{participant.nombreCompleto}</div>
            <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)" }}>{participant.correo}</div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)" }}>Puntos acumulados</div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "var(--fs-h4)", fontWeight: "var(--fw-bold)", color: participant.puntosAcumulados >= 30 ? "var(--pg-d02)" : "var(--text-primary)" }}>
              {participant.puntosAcumulados}
            </div>
          </div>
        </div>

        {/* Project context */}
        <div style={{ fontSize: "var(--fs-label)", color: "var(--text-secondary)" }}>
          <i className="fa-solid fa-folder-open" aria-hidden="true" style={{ marginRight: "var(--space-2)" }} />
          Proyecto: <strong style={{ color: "var(--text-primary)" }}>{project.nombre}</strong>
        </div>

        {/* Bono warning or selection */}
        {disponibles.length === 0 ? (
          <div className="info-banner info-banner--warning">
            <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
            <span>No hay bonos disponibles en el inventario. Solicita un nuevo lote a Juju antes de continuar.</span>
          </div>
        ) : (
          <>
            {disponibles.length <= 5 && (
              <div className="info-banner info-banner--warning">
                <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
                <span>Quedan solo <strong>{disponibles.length}</strong> bonos disponibles. Considera solicitar más a Juju.</span>
              </div>
            )}
            <div className="input-field">
              <label className="input-field__label">Código del bono</label>
              <span className="input-field__helper">Selecciona un bono disponible del inventario</span>
              <select
                className="select-field"
                value={selectedBono}
                onChange={e => setSelectedBono(e.target.value)}
                style={{ width: "100%" }}
              >
                {disponibles.map(b => (
                  <option key={b.codigo} value={b.codigo}>
                    {b.codigo} · {b.puntos} puntos · Vence {b.fechaVencimiento.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                  </option>
                ))}
              </select>
            </div>

            <div className="info-banner info-banner--info">
              <i className="fa-solid fa-envelope" aria-hidden="true" />
              <span>Se enviará automáticamente el correo <strong>P8 · Agradecimiento + código de bono</strong> a {participant.correo} con el código seleccionado.</span>
            </div>
          </>
        )}
      </div>
      <div className="modal__footer">
        <button className="btn btn--secondary" onClick={onClose}>Cancelar</button>
        <button
          className="btn btn--primary"
          disabled={disponibles.length === 0 || !selectedBono}
          style={{ opacity: disponibles.length > 0 && selectedBono ? 1 : 0.5 }}
          onClick={() => onSend(selectedBono)}
        >
          <i className="fa-solid fa-gift" aria-hidden="true" /> Enviar bono
        </button>
      </div>
    </div>
  );
};

export default SendBonoModal;
