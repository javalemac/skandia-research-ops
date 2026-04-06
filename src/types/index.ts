export type Participacion = {
  proyectoId: string;
  proyectoNombre: string;
  fecha: Date;
  tipo: string;
  puntos: number;
  bonoEnviado: boolean;
  estadoInProyecto?: "Candidato" | "Invitado" | "Aceptó" | "Agendado" | "Completó" | "No-Show" | "Rechazado";
};

export type Participante = {
  id: string;
  nombreCorto: string;
  nombreCompleto: string;
  correo: string;
  celular: string;
  esCliente: boolean | null;
  edad: number | null;
  producto: string | null;
  perfil: "Conservador" | "Moderado" | "Arriesgado" | "Empowered" | null;
  segmento: "Finanzas Personales" | "Elite" | "Privilegio" | "Wealth" | "Corporativo" | null;
  puntosAcumulados: number;
  disponibilidad: "Disponible" | "En enfriamiento" | "No contactar";
  consentimiento: "N/A — cliente" | "Vigente" | "Pendiente";
  etiquetas: string[];
  historial: Participacion[];
  fechaUltimaEdicion: Date;
  editadoPor: string;
};

export type Bono = {
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

export type Proyecto = {
  id: string;
  nombre: string;
  tipo: string;
  estado: "En campo" | "Reclutando" | "Planeando" | "Cerrado";
  participantes: number;
  cuota: number;
  responsable: string;
  inicio: string;
  fin: string;
  objetivo?: string;
  enlace?: string;
  links?: { id: string; titulo: string; url: string; tipo: "dovetail" | "sheets" | "figma" | "otro" }[];
};

export type PlantillaTipo = "Invitación" | "Confirmación" | "Recordatorio" | "Seguimiento" | "Agradecimiento";

export type Plantilla = {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  tipo: PlantillaTipo;
  variables: string[];
  asunto: string;
  cuerpo: string;
};

export type ActividadReciente = {
  accion: string;
  participante: string;
  disenador: string;
  tiempo: string;
};

export type EmailTracking = {
  id: string;
  proyectoId: string;
  participanteId: string;
  participanteNombre: string;
  participanteCorreo: string;
  plantillaCodigo: string;
  plantillaNombre: string;
  estado: "Enviado" | "Entregado" | "Abierto" | "Fallido" | "Pendiente";
  fechaEnvio: Date;
  fechaApertura: Date | null;
  enviadoPor: string;
};

export type NavSection = "dashboard" | "participantes" | "proyectos" | "comunicaciones" | "bonos";

export type User = {
  nombre: string;
  rol: "UX Designer" | "Admin";
  email: string;
  avatar?: string;
};
