import { useState, useRef } from "react";
import type { Bono } from "@/types";

interface Props {
  onImport: (bonos: Bono[]) => void;
  onClose: () => void;
  existingGuids: string[];
}

type ParsedBonoRow = {
  guid: string;
  codigo: string;
  puntos: number;
  estado: "Disponible" | "Enviado" | "Vencido";
  fechaCreacion: Date;
  fechaVencimiento: Date;
  investigacion: string | null;
  participanteNombre: string | null;
  participanteCorreo: string | null;
  fechaEnvio: Date | null;
};

type PreviewState = {
  rows: ParsedBonoRow[];
  headers: string[];
  duplicates: string[];
  errors: string[];
};

const ImportBonosModal = ({ onImport, onClose, existingGuids }: Props) => {
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload");
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const parseDate = (dStr: string) => {
    if (!dStr) return null;
    // Asumimos formato DD/MM/YYYY o DD/MM/YYYY HH:mm
    const parts = dStr.split(" ");
    const dateParts = parts[0].split("/");
    if (dateParts.length < 3) return new Date();
    // month is 0-indexed in JS Date
    return new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));
  };

  const parseCSV = (text: string): PreviewState => {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return { rows: [], headers: [], duplicates: [], errors: ["El archivo está vacío o no tiene filas de datos."] };

    const headers = lines[0].split(";").map(h => h.trim().replace(/^"|"$/g, ""));
    const rows: ParsedBonoRow[] = [];
    const duplicates: string[] = [];
    const errors: string[] = [];

    const findCol = (names: string[]) => headers.findIndex(h => names.some(n => h.toLowerCase().includes(n.toLowerCase())));

    const colGuid = findCol(["guid código", "guid cdigo", "guid"]);
    const colCodigo = findCol(["código ingreso", "cdigo ingreso", "codigo ingreso"]);
    const colPuntos = findCol(["puntos del código", "puntos del cdigo", "puntos"]);
    const colEstado = findCol(["estado"]);
    const colInvestigacion = findCol(["investigación", "investigacin", "investigacion"]);
    const colNombre = findCol(["nombre"]);
    const colCorreo = findCol(["correo"]);
    const colFechaEnvio = findCol(["fecha envio bono", "fecha envío bono", "fecha envo bono"]);
    const colFechaCreacion = findCol(["fecha de creación", "fecha de creacin", "fecha de creacion"]);

    if (colGuid === -1 || colCodigo === -1) {
      errors.push("No se encontraron las columnas clave (GUID código, Código ingreso).");
      return { rows: [], headers, duplicates, errors };
    }

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(";").map(c => c.trim().replace(/^"|"$/g, ""));
      const guid = cols[colGuid]?.trim() || "";
      if (!guid) continue;

      if (existingGuids.includes(guid)) {
        duplicates.push(guid);
        continue;
      }

      const codigo = cols[colCodigo] || "";
      const estadoStr = (colEstado >= 0 ? cols[colEstado] : "").trim();
      const estado = estadoStr === "Enviado" ? "Enviado" : estadoStr === "Vencido" ? "Vencido" : "Disponible";
      
      const fechaCStr = colFechaCreacion >= 0 ? cols[colFechaCreacion] : "";
      const fechaCreacion = parseDate(fechaCStr) || new Date();
      
      // Vencimiento 8 meses después
      const fechaVencimiento = new Date(fechaCreacion);
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 8);

      rows.push({
        guid,
        codigo,
        puntos: colPuntos >= 0 ? parseInt(cols[colPuntos]) || 15 : 15,
        estado,
        fechaCreacion,
        fechaVencimiento,
        investigacion: colInvestigacion >= 0 && cols[colInvestigacion] ? cols[colInvestigacion] : null,
        participanteNombre: colNombre >= 0 && cols[colNombre] ? cols[colNombre] : null,
        participanteCorreo: colCorreo >= 0 && cols[colCorreo] ? cols[colCorreo] : null,
        fechaEnvio: colFechaEnvio >= 0 ? parseDate(cols[colFechaEnvio]) : null,
      });
    }

    return { rows, headers, duplicates, errors };
  };

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = parseCSV(text);
      setPreview(result);
      setStep("preview");
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleImport = () => {
    if (!preview) return;
    onImport(preview.rows);
    setStep("done");
  };

  return (
    <div className="modal animate-scale-in" style={{ width: 560 }}>
      <div className="modal__header">
        <h3>
          <i className="fa-solid fa-file-arrow-up" aria-hidden="true" style={{ marginRight: "var(--space-2)" }} />
          Importar Excel de Juju
        </h3>
        <button className="btn btn--ghost btn--icon" onClick={onClose} aria-label="Cerrar">
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>
      </div>

      <div className="modal__body" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        {step === "upload" && (
          <>
            <div className="info-banner info-banner--info">
              <i className="fa-solid fa-circle-info" aria-hidden="true" />
              <span>Sube el reporte de bonos de Juju (CSV con delimitador ';'). Se validarán duplicados por GUID.</span>
            </div>

            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? "var(--pg-00)" : "var(--stroke-01)"}`,
                borderRadius: "var(--radius-md)",
                padding: "var(--space-7) var(--space-4)",
                textAlign: "center",
                cursor: "pointer",
                background: dragOver ? "var(--pg-l05)" : "var(--neutral-l02)",
                transition: "all 150ms ease",
              }}
            >
              <i className="fa-solid fa-cloud-arrow-up" aria-hidden="true" style={{ fontSize: 40, color: dragOver ? "var(--pg-00)" : "var(--neutral-l04)", display: "block", marginBottom: "var(--space-3)" }} />
              <div style={{ fontSize: "var(--fs-label)", fontWeight: "var(--fw-medium)", color: "var(--text-primary)", marginBottom: "var(--space-1)" }}>
                Arrastra tu archivo aquí o haz clic para seleccionarlo
              </div>
              <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)" }}>
                Formatos soportados: CSV con separador ';' (.csv)
              </div>
            </div>
            <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </>
        )}

        {step === "preview" && preview && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--fs-label)", color: "var(--text-secondary)" }}>
              <i className="fa-solid fa-file-csv" aria-hidden="true" style={{ color: "var(--pg-00)" }} />
              <span>{fileName}</span>
              <button className="btn btn--ghost" style={{ marginLeft: "auto", fontSize: "var(--fs-caption)" }} onClick={() => { setStep("upload"); setPreview(null); }}>
                Cambiar archivo
              </button>
            </div>

            {preview.errors.length > 0 && (
              <div className="info-banner info-banner--warning">
                <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
                <div>{preview.errors.map((e, i) => <div key={i}>{e}</div>)}</div>
              </div>
            )}

            {preview.duplicates.length > 0 && (
              <div className="info-banner info-banner--warning">
                <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
                <span>{preview.duplicates.length} códigos ya existen y serán omitidos: {preview.duplicates.slice(0, 3).join(", ")}{preview.duplicates.length > 3 ? ` y ${preview.duplicates.length - 3} más` : ""}</span>
              </div>
            )}

            {preview.rows.length > 0 && (
              <>
                <div style={{ fontSize: "var(--fs-label)", fontWeight: "var(--fw-bold)", color: "var(--text-primary)" }}>
                  Vista previa — {preview.rows.length} bonos a importar
                </div>
                <div className="card" style={{ padding: 0, overflow: "hidden", maxHeight: 280, overflowY: "auto", border: "1px solid var(--stroke-01)" }}>
                  <table className="data-table">
                    <thead style={{ position: "sticky", top: 0, background: "var(--neutral-00)", zIndex: 1 }}>
                      <tr>
                        <th style={{ background: "var(--neutral-l02)" }}>GUID</th>
                        <th style={{ background: "var(--neutral-l02)" }}>Código</th>
                        <th style={{ background: "var(--neutral-l02)" }}>Puntos</th>
                        <th style={{ background: "var(--neutral-l02)" }}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.rows.map((r, i) => (
                        <tr key={i}>
                          <td style={{ fontSize: "var(--fs-caption)", fontFamily: "monospace" }}>{r.guid}</td>
                          <td style={{ fontWeight: "var(--fw-bold)" as any, color: "var(--pg-d02)" }}>{r.codigo}</td>
                          <td style={{ fontSize: "var(--fs-label)" }}>{r.puntos} pts</td>
                          <td>
                            <span className={`badge ${r.estado === "Disponible" ? "badge--info" : r.estado === "Enviado" ? "badge--neutral" : "badge--error"}`}>
                              {r.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}

        {step === "done" && (
          <div style={{ textAlign: "center", padding: "var(--space-5)" }}>
            <div style={{ width: 56, height: 56, borderRadius: "var(--radius-full)", background: "var(--success-light)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "var(--space-3)" }}>
              <i className="fa-solid fa-check" aria-hidden="true" style={{ fontSize: 24, color: "var(--pg-d02)" }} />
            </div>
            <h3 style={{ marginBottom: "var(--space-2)" }}>¡Importación exitosa!</h3>
            <p style={{ fontSize: "var(--fs-label)", color: "var(--text-secondary)" }}>
              Se importaron <strong>{preview?.rows.length || 0}</strong> bonos correctamente.
              {(preview?.duplicates.length || 0) > 0 && ` Se omitieron ${preview?.duplicates.length} duplicados.`}
            </p>
          </div>
        )}
      </div>

      <div className="modal__footer">
        {step === "upload" && <button className="btn btn--secondary" onClick={onClose}>Cancelar</button>}
        {step === "preview" && (
          <>
            <button className="btn btn--secondary" onClick={onClose}>Cancelar</button>
            <button
              className="btn btn--primary"
              disabled={!preview || preview.rows.length === 0}
              style={{ opacity: preview && preview.rows.length > 0 ? 1 : 0.5 }}
              onClick={handleImport}
            >
              <i className="fa-solid fa-file-import" aria-hidden="true" /> Importar {preview?.rows.length || 0} bonos
            </button>
          </>
        )}
        {step === "done" && (
          <button className="btn btn--primary" onClick={onClose}>Cerrar</button>
        )}
      </div>
    </div>
  );
};

export default ImportBonosModal;
