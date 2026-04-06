import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import type { Plantilla, PlantillaTipo } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import EmailTrackingTable from "@/components/proyectos/EmailTrackingTable";

const tipoBadgeClass: Record<PlantillaTipo, string> = {
  "Invitación": "bg-blue-100 text-blue-800 border-blue-200",
  "Confirmación": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Recordatorio": "bg-amber-100 text-amber-800 border-amber-200",
  "Seguimiento": "bg-purple-100 text-purple-800 border-purple-200",
  "Agradecimiento": "bg-pink-100 text-pink-800 border-pink-200",
};

const tipoIcon: Record<PlantillaTipo, string> = {
  "Invitación": "fa-solid fa-paper-plane",
  "Confirmación": "fa-solid fa-circle-check",
  "Recordatorio": "fa-solid fa-bell",
  "Seguimiento": "fa-solid fa-chart-line",
  "Agradecimiento": "fa-solid fa-gift",
};

const allTipos: PlantillaTipo[] = ["Invitación", "Confirmación", "Recordatorio", "Seguimiento", "Agradecimiento"];

const Comunicaciones = () => {
  const plantillas = useAppStore(state => state.plantillas);
  const emailTracking = useAppStore(state => state.emailTracking);
  const updatePlantilla = useAppStore(state => state.updatePlantilla);
  
  const [viewPlantilla, setViewPlantilla] = useState<Plantilla | null>(null);
  const [editPlantilla, setEditPlantilla] = useState<Plantilla | null>(null);
  const [editAsunto, setEditAsunto] = useState("");
  const [editCuerpo, setEditCuerpo] = useState("");
  const [filterTipo, setFilterTipo] = useState<PlantillaTipo | "Todos">("Todos");

  // Métricas para el Dashboard de Comunicaciones
  const totalEnviados = emailTracking.length;
  const abiertos = emailTracking.filter(e => e.estado === "Abierto").length;
  const entregados = emailTracking.filter(e => e.estado === "Entregado").length;
  const fallidos = emailTracking.filter(e => e.estado === "Fallido").length;
  const tasaApertura = totalEnviados > 0 ? Math.round((abiertos / totalEnviados) * 100) : 0;

  const filtered = filterTipo === "Todos" ? plantillas : plantillas.filter(p => p.tipo === filterTipo);

  const openEdit = (p: Plantilla) => {
    setEditPlantilla(p);
    setEditAsunto(p.asunto);
    setEditCuerpo(p.cuerpo);
  };

  const saveEdit = () => {
    if (!editPlantilla) return;
    updatePlantilla(editPlantilla.id, {
      asunto: editAsunto,
      cuerpo: editCuerpo
    });
    toast.success(`Plantilla "${editPlantilla?.codigo}" actualizada`);
    setEditPlantilla(null);
  };

  const renderCuerpoConVariables = (cuerpo: string) => {
    return cuerpo.replace(/\[([^\]]+)\]/g, (_, v) => `«${v}»`);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header__left">
          <h1>Comunicaciones</h1>
          <span style={{ color: "var(--text-secondary)", fontSize: "var(--fs-body)" }}>
            {filtered.length} plantilla{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "var(--space-3)", marginBottom: "var(--space-5)" }}>
          {[
            { label: "Total enviados", val: totalEnviados, icon: "fa-paper-plane", color: "var(--neutral-l04)", bg: "var(--neutral-l01)" },
            { label: "Tasa apertura", val: `${tasaApertura}%`, icon: "fa-envelope-open", color: "var(--pg-00)", bg: "var(--pg-l05)" },
            { label: "Entregados", val: entregados, icon: "fa-check", color: "var(--info-dark)", bg: "var(--info-light)" },
            { label: "Abiertos", val: abiertos, icon: "fa-eye", color: "var(--pg-d02)", bg: "var(--pg-l04)" },
            { label: "Fallidos", val: fallidos, icon: "fa-triangle-exclamation", color: "var(--error-dark)", bg: "var(--error-light)" },
          ].map((kpi, i) => (
            <div key={i} className="card card--hover" style={{ padding: "var(--space-3)", position: "relative", overflow: "hidden", borderLeft: `4px solid ${kpi.color}`, background: kpi.bg }}>
              <i className={`fa-solid ${kpi.icon}`} style={{ position: "absolute", right: -8, bottom: -8, fontSize: "40px", opacity: 0.05, color: kpi.color }} />
              <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)", marginBottom: "var(--space-1)", fontWeight: "var(--fw-medium)" }}>{kpi.label}</div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: "var(--fs-h3)", fontWeight: "var(--fw-bold)" as any, color: "var(--text-primary)" }}>{kpi.val}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-3)" }}>
          <h2 style={{ fontSize: "var(--fs-label)", color: "var(--text-secondary)", fontWeight: "var(--fw-bold)" as any, textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Plantillas Disponibles</h2>
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <button
              className={`chip ${filterTipo === "Todos" ? "chip--active" : ""}`}
              onClick={() => setFilterTipo("Todos")}
            >
              Todos
            </button>
            {allTipos.map(tipo => (
              <button
                key={tipo}
                className={`chip ${filterTipo === tipo ? "chip--active" : ""}`}
                onClick={() => setFilterTipo(tipo)}
              >
                <i className={tipoIcon[tipo]} style={{ fontSize: "11px" }} /> {tipo}
              </button>
            ))}
          </div>
        </div>

      {/* Listado */}
      <div className="template-list" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        {filtered.map(t => (
          <div key={t.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--space-3)" }}>
            <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start", flex: 1 }}>
              <i className="fa-regular fa-envelope" aria-hidden="true" style={{ color: "var(--text-secondary)", fontSize: "var(--fs-h4)", marginTop: "var(--space-1)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)", flexWrap: "wrap" }}>
                  <span style={{ fontWeight: "var(--fw-bold)" as any }}>
                    {t.codigo} · {t.nombre}
                  </span>
                  <Badge className={`${tipoBadgeClass[t.tipo]} text-[11px] px-2 py-0`} variant="outline">
                    <i className={tipoIcon[t.tipo]} style={{ fontSize: "10px", marginRight: "4px" }} />
                    {t.tipo}
                  </Badge>
                </div>
                <div style={{ fontSize: "var(--fs-label)", color: "var(--text-secondary)", marginBottom: "var(--space-2)" }}>
                  {t.descripcion}
                </div>
                <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                  {t.variables.map(v => (
                    <span key={v} className="chip chip--tag" style={{ fontSize: "11px", padding: "2px 8px" }}>[{v}]</span>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "var(--space-2)", flexShrink: 0 }}>
              <button className="btn btn--ghost" onClick={() => setViewPlantilla(t)}>
                <i className="fa-solid fa-eye" style={{ marginRight: "4px" }} /> Ver
              </button>
              <button className="btn btn--secondary" onClick={() => openEdit(t)}>
                <i className="fa-solid fa-pen" style={{ marginRight: "4px" }} /> Editar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Historial de Envíos */}
      <div style={{ marginTop: "var(--space-7)" }}>
        <h2 style={{ fontSize: "var(--fs-label)", color: "var(--text-secondary)", fontWeight: "var(--fw-bold)" as any, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--space-3)" }}>Historial de Envíos Recientes</h2>
        <EmailTrackingTable emails={emailTracking} />
      </div>

      {/* Modal Ver */}
      <Dialog open={!!viewPlantilla} onOpenChange={() => setViewPlantilla(null)}>
        <DialogContent className="sm:max-w-[640px]" style={{ background: "var(--neutral-00)" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <i className="fa-regular fa-envelope" />
              {viewPlantilla?.codigo} · {viewPlantilla?.nombre}
            </DialogTitle>
            <DialogDescription>
              Vista previa de la plantilla de comunicación
            </DialogDescription>
          </DialogHeader>
          {viewPlantilla && (
            <div className="space-y-4" style={{ maxHeight: "60vh", overflowY: "auto" }}>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`${tipoBadgeClass[viewPlantilla.tipo]} text-xs px-2`} variant="outline">
                  <i className={tipoIcon[viewPlantilla.tipo]} style={{ fontSize: "10px", marginRight: "4px" }} />
                  {viewPlantilla.tipo}
                </Badge>
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{viewPlantilla.descripcion}</span>
              </div>

              <div>
                <label style={{ fontSize: "var(--fs-caption)", fontWeight: "var(--fw-bold)" as any, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Variables</label>
                <div className="flex gap-2 flex-wrap mt-1">
                  {viewPlantilla.variables.map(v => (
                    <span key={v} className="chip chip--tag" style={{ fontSize: "11px", padding: "2px 8px" }}>[{v}]</span>
                  ))}
                </div>
              </div>

              <div style={{ background: "var(--neutral-l02)", border: "1px solid var(--stroke-01)", borderRadius: "var(--radius-md)", padding: "var(--space-4)" }}>
                <div>
                  <label style={{ fontSize: "var(--fs-caption)", fontWeight: "var(--fw-bold)" as any, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Asunto</label>
                  <p style={{ fontSize: "var(--fs-label)", fontWeight: "var(--fw-medium)" as any, marginTop: "var(--space-1)" }}>{viewPlantilla.asunto}</p>
                </div>
                <hr style={{ borderColor: "var(--stroke-01)", margin: "var(--space-3) 0" }} />
                <div>
                  <label style={{ fontSize: "var(--fs-caption)", fontWeight: "var(--fw-bold)" as any, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Cuerpo del correo</label>
                  <p style={{ fontSize: "var(--fs-label)", marginTop: "var(--space-1)", lineHeight: "1.6", whiteSpace: "pre-wrap", color: "var(--text-primary)" }}>
                    {renderCuerpoConVariables(viewPlantilla.cuerpo)}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <button className="btn btn--ghost" onClick={() => setViewPlantilla(null)}>Cerrar</button>
            <button className="btn btn--primary" onClick={() => { setViewPlantilla(null); if (viewPlantilla) openEdit(viewPlantilla); }}>
              <i className="fa-solid fa-pen" style={{ marginRight: "4px" }} /> Editar plantilla
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar */}
      <Dialog open={!!editPlantilla} onOpenChange={() => setEditPlantilla(null)}>
        <DialogContent className="sm:max-w-[640px]" style={{ background: "var(--neutral-00)" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <i className="fa-solid fa-pen-to-square" />
              Editar: {editPlantilla?.codigo} · {editPlantilla?.nombre}
            </DialogTitle>
            <DialogDescription>
              Modifica el asunto y cuerpo de la plantilla
            </DialogDescription>
          </DialogHeader>
          {editPlantilla && (
            <div className="space-y-4" style={{ maxHeight: "60vh", overflowY: "auto" }}>
              <div className="flex items-center gap-2">
                <Badge className={`${tipoBadgeClass[editPlantilla.tipo]} text-xs px-2`} variant="outline">
                  <i className={tipoIcon[editPlantilla.tipo]} style={{ fontSize: "10px", marginRight: "4px" }} />
                  {editPlantilla.tipo}
                </Badge>
              </div>

              <div>
                <label style={{ fontSize: "var(--fs-caption)", fontWeight: "var(--fw-bold)" as any, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--space-1)", display: "block" }}>
                  Variables disponibles
                </label>
                <div className="flex gap-2 flex-wrap">
                  {editPlantilla.variables.map(v => (
                    <span
                      key={v}
                      className="chip chip--tag cursor-pointer hover:opacity-80"
                      style={{ fontSize: "11px", padding: "2px 8px" }}
                      title={`Clic para copiar [${v}]`}
                      onClick={() => { navigator.clipboard.writeText(`[${v}]`); toast.info(`Copiado: [${v}]`); }}
                    >
                      [{v}]
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: "var(--fs-caption)", fontWeight: "var(--fw-bold)" as any, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--space-1)", display: "block" }}>Asunto</label>
                <input
                  className="input-field__input"
                  value={editAsunto}
                  onChange={e => setEditAsunto(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "var(--fs-caption)", fontWeight: "var(--fw-bold)" as any, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--space-1)", display: "block" }}>Cuerpo del correo</label>
                <textarea
                  className="input-field__input"
                  value={editCuerpo}
                  onChange={e => setEditCuerpo(e.target.value)}
                  rows={8}
                  style={{ width: "100%", resize: "vertical", fontFamily: "inherit", lineHeight: "1.6", padding: "var(--space-2) var(--space-3)", height: "auto" }}
                />
              </div>

              {/* Preview */}
              <div style={{ background: "var(--neutral-l02)", border: "1px solid var(--stroke-01)", borderRadius: "var(--radius-md)", padding: "var(--space-3)" }}>
                <label style={{ fontSize: "var(--fs-caption)", fontWeight: "var(--fw-bold)" as any, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--space-1)", display: "block" }}>Vista previa</label>
                <p style={{ fontSize: "var(--fs-caption)", fontWeight: "var(--fw-medium)" as any }}>{editAsunto}</p>
                <hr style={{ borderColor: "var(--stroke-01)", margin: "var(--space-2) 0" }} />
                <p style={{ fontSize: "var(--fs-caption)", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{renderCuerpoConVariables(editCuerpo)}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <button className="btn btn--ghost" onClick={() => setEditPlantilla(null)}>Cancelar</button>
            <button className="btn btn--primary" onClick={saveEdit}>
              <i className="fa-solid fa-check" style={{ marginRight: "4px" }} /> Guardar cambios
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Comunicaciones;
