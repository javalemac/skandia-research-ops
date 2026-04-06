import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Participante, 
  Bono, 
  Proyecto, 
  Plantilla, 
  EmailTracking, 
  ActividadReciente,
  User
} from '@/types';
import * as mockData from '@/data/mockData';

interface AppState {
  participantes: Participante[];
  bonos: Bono[];
  proyectos: Proyecto[];
  plantillas: Plantilla[];
  updatePlantilla: (id: string, fields: Partial<Plantilla>) => void;
  emailTracking: EmailTracking[];
  actividadReciente: ActividadReciente[];

  // Acciones - Auth
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string) => void;
  logout: () => void;

  // Acciones - Participantes
  addParticipante: (p: Participante) => { ok: boolean; error?: string };
  updateParticipante: (id: string, fields: Partial<Participante>) => void;
  marcarNoContactar: (id: string) => void;
  deleteParticipante: (id: string) => void;
  importarParticipantes: (csvData: string, updateExisting?: boolean) => { importados: number; actualizados: number; omitidos: number };

  // Acciones - Bonos
  importarBonosJuju: (nuevosBonos: Bono[]) => { importados: number; duplicados: number };
  asignarBono: (guid: string, participanteId: string, proyectoId: string) => void;

  // Acciones - Proyectos
  addProyecto: (p: Proyecto) => void;
  updateProyecto: (id: string, fields: Partial<Proyecto>) => void;
  deleteProyecto: (id: string) => void;

  // Acciones - Email Tracking
  registrarEnvio: (data: EmailTracking) => void;

  // Acciones - Actividad
  addActividad: (a: ActividadReciente) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      participantes: mockData.participantes,
      bonos: mockData.bonos,
      proyectos: mockData.proyectos,
      plantillas: mockData.plantillas,
      emailTracking: mockData.emailTracking,
      actividadReciente: mockData.actividadReciente,

      isAuthenticated: false,
      user: null,

      login: (email: string) => {
        set({
          isAuthenticated: true,
          user: {
            nombre: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            rol: "UX Designer",
            email: email
          }
        });
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null
        });
      },

      // Participantes
      addParticipante: (p) => {
        const exists = get().participantes.some(existente => existente.correo.toLowerCase() === p.correo.toLowerCase());
        if (exists) return { ok: false, error: 'El correo ya existe' };
        
        set((state) => ({
          participantes: [p, ...state.participantes],
          actividadReciente: [
            { accion: 'Participante agregado', participante: p.nombreCompleto, disenador: 'Sistema', tiempo: 'Ahora' },
            ...state.actividadReciente
          ]
        }));
        return { ok: true };
      },

      updateParticipante: (id, fields) => {
        set((state) => ({
          participantes: state.participantes.map(p => p.id === id ? { ...p, ...fields, fechaUltimaEdicion: new Date() } : p)
        }));
      },

      marcarNoContactar: (id) => {
        set((state) => ({
          participantes: state.participantes.map(p => p.id === id ? { ...p, disponibilidad: 'No contactar' } : p)
        }));
      },
      
      deleteParticipante: (id) => {
        set((state) => ({
          participantes: state.participantes.filter(p => p.id !== id)
        }));
      },

      importarParticipantes: (csvData: string, updateExisting: boolean = false) => {
        const lines = csvData.split(/\r?\n/).filter(line => line.trim());
        if (lines.length < 2) return { importados: 0, actualizados: 0, omitidos: 0 };

        // Detectar si la primera fila son los headers reales (ignorando puntos y coma iniciales)
        const headerIndex = lines.findIndex(l => l.toLowerCase().includes("correo") || l.toLowerCase().includes("participante"));
        if (headerIndex === -1) return { importados: 0, actualizados: 0, omitidos: 0 };
        
        const headers = lines[headerIndex].split(";").map(h => h.trim().replace(/^"|"$/g, ""));
        const findCol = (keys: string[]) => headers.findIndex(h => keys.some(k => h.toLowerCase().includes(k.toLowerCase())));

        const colNombre = findCol(["nombre participante", "nombre completo", "nombre"]);
        const colNombreCorto = findCol(["nombre para correo"]);
        const colCorreo = findCol(["correo participante", "correo electronico", "email", "correo"]);
        const colCelular = findCol(["celular", "telefono"]);
        const colCliente = findCol(["cliente", "es cliente"]);
        const colEdad = findCol(["edad"]);
        const colProducto = findCol(["producto"]);
        const colPerfil = findCol(["perfil"]);
        const colSegmento = findCol(["segmento"]);

        if (colCorreo === -1) {
          console.error("No se encontró columna de correo");
          return { importados: 0, actualizados: 0, omitidos: 0 };
        }

        const newParticipantes: Participante[] = [];
        let updatedCount = 0;
        let skippedCount = 0;

        const currentParticipantes = get().participantes;

        for (let i = headerIndex + 1; i < lines.length; i++) {
          const cols = lines[i].split(";").map(c => c.trim().replace(/^"|"$/g, ""));
          const correo = cols[colCorreo]?.toLowerCase();
          if (!correo) continue;

          const existing = currentParticipantes.find(p => p.correo.toLowerCase() === correo);
          
          const esClienteStr = colCliente >= 0 ? cols[colCliente] : "";
          const esCliente = esClienteStr.toLowerCase() === "si" || esClienteStr.toLowerCase() === "sí";
          const consentimiento: "N/A — cliente" | "Vigente" | "Pendiente" = esCliente ? "N/A — cliente" : "Pendiente";

          const pData: Partial<Participante> = {
            nombreCompleto: colNombre >= 0 && cols[colNombre] ? cols[colNombre] : (existing?.nombreCompleto || "Sin nombre"),
            nombreCorto: colNombreCorto >= 0 && cols[colNombreCorto] ? cols[colNombreCorto] : (colNombre >= 0 && cols[colNombre] ? cols[colNombre].split(" ")[0] : (existing?.nombreCorto || "Usuario")),
            celular: colCelular >= 0 ? cols[colCelular] : (existing?.celular || ""),
            esCliente,
            edad: colEdad >= 0 ? parseInt(cols[colEdad]) || existing?.edad || null : (existing?.edad || null),
            producto: colProducto >= 0 ? cols[colProducto] : (existing?.producto || null),
            perfil: colPerfil >= 0 ? cols[colPerfil] : (existing?.perfil || null) as any,
            segmento: colSegmento >= 0 ? cols[colSegmento] : (existing?.segmento || null) as any,
            consentimiento,
            fechaUltimaEdicion: new Date(),
          };

          if (existing) {
            if (updateExisting) {
              set((state) => ({
                participantes: state.participantes.map(p => 
                  p.id === existing.id ? { ...p, ...pData, editadoPor: "Update CSV" } : p
                )
              }));
              updatedCount++;
            } else {
              skippedCount++;
            }
          } else {
            const nuevo: Participante = {
              id: `P${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              nombreCompleto: pData.nombreCompleto!,
              nombreCorto: pData.nombreCorto!,
              correo,
              celular: pData.celular!,
              esCliente: pData.esCliente!,
              edad: pData.edad!,
              producto: pData.producto!,
              perfil: pData.perfil as any,
              segmento: pData.segmento as any,
              puntosAcumulados: 0,
              disponibilidad: "Disponible",
              consentimiento: pData.consentimiento!,
              etiquetas: [],
              historial: [],
              fechaUltimaEdicion: new Date(),
              editadoPor: "Import CSV",
            };
            newParticipantes.push(nuevo);
          }
        }

        if (newParticipantes.length > 0) {
          set((state) => ({
            participantes: [...state.participantes, ...newParticipantes]
          }));
        }

        return { 
          importados: newParticipantes.length, 
          actualizados: updatedCount, 
          omitidos: skippedCount 
        };
      },

      // Bonos
      importarBonosJuju: (nuevosBonos) => {
        const currentGuids = new Set(get().bonos.map(b => b.guid));
        const filtrados = nuevosBonos.filter(b => !currentGuids.has(b.guid));

        set((state) => ({
          bonos: [...state.bonos, ...filtrados].sort((a, b) => 
            new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime()
          )
        }));

        return { importados: filtrados.length, duplicados: nuevosBonos.length - filtrados.length };
      },

      updatePlantilla: (id, fields) => {
        set((state) => ({
          plantillas: state.plantillas.map(t => t.id === id ? { ...t, ...fields } : t)
        }));
      },

      asignarBono: (guid, participanteId, proyectoId) => {
        const participante = get().participantes.find(p => p.id === participanteId);
        const proyecto = get().proyectos.find(p => p.id === proyectoId);

        set((state) => ({
          bonos: state.bonos.map(b => b.guid === guid ? {
            ...b,
            estado: 'Enviado',
            participanteNombre: participante?.nombreCompleto || 'Desconocido',
            participanteCorreo: participante?.correo || 'Desconocido',
            investigacion: proyecto?.nombre || 'General',
            fechaEnvio: new Date()
          } : b),
          actividadReciente: [
            { 
              accion: 'Bono enviado (P8)', 
              participante: participante?.nombreCompleto || 'Desconocido', 
              disenador: 'Sistema', 
              tiempo: 'Ahora' 
            },
            ...state.actividadReciente
          ]
        }));
      },

      // Proyectos
      addProyecto: (p) => {
        set((state) => ({ proyectos: [p, ...state.proyectos] }));
      },

      updateProyecto: (id, fields) => {
        set((state) => ({
          proyectos: state.proyectos.map(p => p.id === id ? { ...p, ...fields } : p)
        }));
      },

      deleteProyecto: (id) => {
        set((state) => ({
          proyectos: state.proyectos.filter(p => p.id !== id)
        }));
      },

      // Email Tracking
      registrarEnvio: (nuevo) => {
        set((state) => ({
          emailTracking: [nuevo, ...state.emailTracking],
          actividadReciente: [
            { 
              accion: `Correo enviado (${nuevo.plantillaCodigo})`, 
              participante: nuevo.participanteNombre, 
              disenador: nuevo.enviadoPor, 
              tiempo: 'Ahora' 
            },
            ...state.actividadReciente
          ]
        }));

        // Simulación para el MVP: Marcar como abierto tras 5 segundos
        setTimeout(() => {
          set((state) => ({
            emailTracking: state.emailTracking.map(e => 
              e.id === nuevo.id ? { ...e, estado: 'Abierto', fechaApertura: new Date() } : e
            )
          }));
        }, 5000);
      },

      addActividad: (a) => {
        set((state) => ({
          actividadReciente: [a, ...state.actividadReciente]
        }));
      }
    }),
    {
      name: 'skandia-research-ops-storage',
      // Manejo específico para fechas (JSON.stringify las convierte a strings)
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Opcional: Podríamos convertir strings de fechas a objetos Date aquí,
          // pero date-fns y los componentes suelen manejar los strings de fechas de ISO bien,
          // o podemos mapearlos individualmente.
        }
      }
    }
  )
);
