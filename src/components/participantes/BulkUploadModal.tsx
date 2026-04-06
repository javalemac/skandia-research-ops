import { useState, useRef } from "react";
import type { Participante } from "@/types";

interface Props {
  existingEmails: string[];
  onImport: (csvData: string, updateExisting: boolean) => { importados: number; actualizados: number; omitidos: number } | void;
  onClose: () => void;
}

type ParsedRow = {
  nombreCorto: string;
  nombreCompleto: string;
  correo: string;
  celular: string;
  esCliente: boolean | null;
  edad: number | null;
  segmento: string | null;
  producto: string | null;
  perfil: string | null;
};

type PreviewState = {
  rows: ParsedRow[];
  headers: string[];
  duplicates: string[];
  errors: string[];
};

const BulkUploadModal = ({ existingEmails, onImport, onClose }: Props) => {
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload");
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [fileName, setFileName] = useState("");
  const [updateExisting, setUpdateExisting] = useState(false);
  const [rawCsv, setRawCsv] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): PreviewState => {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return { rows: [], headers: [], duplicates: [], errors: ["El archivo está vacío o no tiene filas de datos."] };

    const headers = lines[0].split(";").map(h => h.trim().replace(/^"|"$/g, ""));
    const rows: ParsedRow[] = [];
    const duplicates: string[] = [];
    const errors: string[] = [];

    const findCol = (names: string[]) => {
      const idx = headers.findIndex(h => names.some(n => h.toLowerCase().trim() === n.toLowerCase()));
      // Si no encuentra exacto, busca inclusión
      if (idx === -1) {
        return headers.findIndex(h => names.some(n => h.toLowerCase().includes(n.toLowerCase())));
      }
      return idx;
    };

    const colNombre = findCol(["nombre participante", "nombre completo", "nombreCompleto"]);
    const colCorto = findCol(["nombre para correo", "nombre corto", "nombreCorto"]);
    const colCorreo = findCol(["correo participante", "correo", "email"]);
    const colCelular = findCol(["celular", "teléfono", "telefono", "phone", "cel"]);
    const colCliente = findCol(["cliente", "es cliente", "esCliente"]);
    const colEdad = findCol(["edad", "age"]);
    const colSegmento = findCol(["segmento", "segment"]);
    const colProducto = findCol(["producto", "product"]);
    const colPerfil = findCol(["perfil", "profile"]);

    if (colCorreo === -1) {
      errors.push("No se encontró una columna de correo electrónico ('Correo participante').");
      return { rows: [], headers, duplicates, errors };
    }
    if (colNombre === -1 && colCorto === -1) {
      errors.push("No se encontró una columna de nombre ('Nombre participante' o 'Nombre para correo').");
      return { rows: [], headers, duplicates, errors };
    }

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(";").map(c => c.trim().replace(/^"|"$/g, ""));
      const correo = cols[colCorreo]?.trim() || "";
      if (!correo) continue;

      if (existingEmails.includes(correo.toLowerCase())) {
        duplicates.push(correo);
      }

      const nombreCompleto = colNombre >= 0 ? cols[colNombre] || "" : "";
      const nombreCorto = colCorto >= 0 ? cols[colCorto] || "" : nombreCompleto.split(" ")[0] || "";
      const edadRaw = colEdad >= 0 ? parseInt(cols[colEdad]) : null;

      rows.push({
        nombreCorto: nombreCorto || nombreCompleto.split(" ")[0] || "—",
        nombreCompleto: nombreCompleto || nombreCorto,
        correo,
        celular: colCelular >= 0 ? cols[colCelular] || "" : "",
        esCliente: colCliente >= 0 && cols[colCliente] ? (cols[colCliente]?.toLowerCase() === "si" ? true : cols[colCliente]?.toLowerCase() === "no" ? false : null) : null,
        edad: edadRaw && !isNaN(edadRaw) ? edadRaw : null,
        segmento: colSegmento >= 0 ? cols[colSegmento] || null : null,
        producto: colProducto >= 0 ? cols[colProducto] || null : null,
        perfil: colPerfil >= 0 ? cols[colPerfil] || null : null,
      });
    }

    return { rows, headers, duplicates, errors };
  };

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setRawCsv(text);
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
    if (!rawCsv) return;
    onImport(rawCsv, updateExisting);
    setStep("done");
  };

  return (
    <div className="modal animate-scale-in" style={{ width: 560 }}>
      <div className="modal__header">
        <h3>
          <i className="fa-solid fa-file-arrow-up" aria-hidden="true" style={{ marginRight: "var(--space-2)" }} />
          Carga masiva de participantes
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
              <span>Sube un archivo CSV o Excel con las columnas: <strong>Nombre completo, Correo, Celular</strong>. Las columnas de segmento, producto y perfil son opcionales.</span>
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
              <div style={{ 
                background: "var(--warning-light)", 
                border: "1px solid var(--warning-dark)", 
                borderRadius: "var(--radius-md)", 
                padding: "var(--space-3) var(--space-4)", 
                marginBottom: "var(--space-4)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-2)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", color: "#856404" }}>
                  <i className="fa-solid fa-triangle-exclamation" />
                  <span style={{ fontWeight: "var(--fw-bold)" as any, fontSize: "var(--fs-label)" }}>
                    Se detectaron {preview.duplicates.length} participantes que ya existen en la base de datos
                  </span>
                </div>
                <label style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "var(--space-2)", 
                  cursor: "pointer",
                  fontSize: "var(--fs-caption)",
                  color: "#856404"
                }}>
                  <input 
                    type="checkbox" 
                    checked={updateExisting} 
                    onChange={(e) => setUpdateExisting(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: "var(--warning-dark)" }}
                  />
                  <span>Actualizar datos de estos participantes con la información del CSV</span>
                </label>
              </div>
            )}

            {preview.rows.length > 0 && (
              <>
                <div style={{ fontSize: "var(--fs-label)", fontWeight: "var(--fw-bold)", color: "var(--text-primary)" }}>
                  Vista previa — {preview.rows.length} participantes a importar
                </div>
                <div className="card" style={{ padding: 0, overflow: "hidden", maxHeight: 280, overflowY: "auto" }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Celular</th>
                        <th>Segmento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.rows.map((r, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: "var(--fw-medium)" }}>{r.nombreCompleto}</td>
                          <td>{r.correo}</td>
                          <td>{r.celular || <span className="text-null">—</span>}</td>
                          <td>{r.segmento ? <span className="badge badge--neutral">{r.segmento}</span> : <span className="text-null">—</span>}</td>
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
              Se procesaron <strong>{(preview?.rows.length || 0)}</strong> participantes correctamente.
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
              <i className="fa-solid fa-file-import" aria-hidden="true" /> Importar {preview?.rows.length || 0} participantes
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

export default BulkUploadModal;
