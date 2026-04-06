import type { Participante, Bono, Proyecto, Plantilla, ActividadReciente, EmailTracking } from "@/types";

export const participantes: Participante[] = [
  {
    id: "P001", nombreCorto: "Juan David", nombreCompleto: "Juan David Pérez Mora",
    correo: "jperez@gmail.com", celular: "3201234567",
    esCliente: true, edad: 42,
    producto: "MFUND", perfil: "Moderado", segmento: "Wealth",
    puntosAcumulados: 25, disponibilidad: "Disponible",
    consentimiento: "N/A — cliente", etiquetas: ["Muy comunicativo", "Experto en fondos"],
    historial: [
      { proyectoId: "PR001", proyectoNombre: "App Pensiones V3", fecha: new Date("2024-11-14"), tipo: "Entrevista", puntos: 15, bonoEnviado: false },
      { proyectoId: "PR002", proyectoNombre: "Onboarding Elite", fecha: new Date("2024-08-03"), tipo: "Test remoto", puntos: 10, bonoEnviado: false }
    ],
    fechaUltimaEdicion: new Date("2025-01-10"), editadoPor: "Ana Ríos"
  },
  {
    id: "P002", nombreCorto: "Ana María", nombreCompleto: "Ana María García López",
    correo: "agarcia@gmail.com", celular: "3107654321",
    esCliente: true, edad: 35,
    producto: "FIC efectivo", perfil: "Arriesgado", segmento: "Elite",
    puntosAcumulados: 30, disponibilidad: "En enfriamiento",
    consentimiento: "N/A — cliente", etiquetas: ["Alta disposición"],
    historial: [
      { proyectoId: "PR001", proyectoNombre: "App Pensiones V3", fecha: new Date("2025-01-20"), tipo: "Entrevista", puntos: 15, bonoEnviado: true },
      { proyectoId: "PR003", proyectoNombre: "Portal Contigo", fecha: new Date("2024-10-05"), tipo: "Test remoto", puntos: 10, bonoEnviado: true },
      { proyectoId: "PR004", proyectoNombre: "Notificaciones", fecha: new Date("2024-07-12"), tipo: "Entrevista", puntos: 15, bonoEnviado: true }
    ],
    fechaUltimaEdicion: new Date("2025-01-22"), editadoPor: "Carlos Muñoz"
  },
  {
    id: "P003", nombreCorto: "Carlos", nombreCompleto: "Carlos Andrés Torres Bermúdez",
    correo: "ctorres@gmail.com", celular: "3156789012",
    esCliente: true, edad: null,
    producto: null, perfil: "Conservador", segmento: "Finanzas Personales",
    puntosAcumulados: 10, disponibilidad: "Disponible",
    consentimiento: "N/A — cliente", etiquetas: [],
    historial: [
      { proyectoId: "PR002", proyectoNombre: "Onboarding Elite", fecha: new Date("2024-09-18"), tipo: "Encuesta", puntos: 5, bonoEnviado: false },
      { proyectoId: "PR005", proyectoNombre: "Akaunt Rediseño", fecha: new Date("2024-12-01"), tipo: "Test remoto", puntos: 10, bonoEnviado: false }
    ],
    fechaUltimaEdicion: new Date("2024-12-02"), editadoPor: "Ana Ríos"
  },
  {
    id: "P004", nombreCorto: "Lucía", nombreCompleto: "Lucía Fernanda Ramos Castro",
    correo: "lramos@gmail.com", celular: "3189012345",
    esCliente: true, edad: 29,
    producto: "FPOB", perfil: null, segmento: "Privilegio",
    puntosAcumulados: 5, disponibilidad: "Disponible",
    consentimiento: "N/A — cliente", etiquetas: ["Baja habilidad técnica"],
    historial: [
      { proyectoId: "PR005", proyectoNombre: "Akaunt Rediseño", fecha: new Date("2025-01-05"), tipo: "Encuesta", puntos: 5, bonoEnviado: false }
    ],
    fechaUltimaEdicion: new Date("2025-01-06"), editadoPor: "María López"
  },
  {
    id: "P005", nombreCorto: "Alejandro", nombreCompleto: "Alejandro Gamboa Meza",
    correo: "agamboa@gmail.com", celular: "3204567890",
    esCliente: true, edad: 38,
    producto: "FIC efectivo", perfil: "Empowered", segmento: null,
    puntosAcumulados: 0, disponibilidad: "Disponible",
    consentimiento: "N/A — cliente", etiquetas: [],
    historial: [],
    fechaUltimaEdicion: new Date("2025-01-15"), editadoPor: "Carlos Muñoz"
  },
  {
    id: "P006", nombreCorto: "Sofía", nombreCompleto: "Sofía Ruiz Palomino",
    correo: "sruiz@gmail.com", celular: "3143456789",
    esCliente: false, edad: 26,
    producto: null, perfil: null, segmento: null,
    puntosAcumulados: 20, disponibilidad: "Disponible",
    consentimiento: "Vigente", etiquetas: ["Usuario externo", "Muy comunicativo"],
    historial: [
      { proyectoId: "PR003", proyectoNombre: "Portal Contigo", fecha: new Date("2024-11-20"), tipo: "Test remoto", puntos: 10, bonoEnviado: false },
      { proyectoId: "PR005", proyectoNombre: "Akaunt Rediseño", fecha: new Date("2025-01-10"), tipo: "Test remoto", puntos: 10, bonoEnviado: false }
    ],
    fechaUltimaEdicion: new Date("2025-01-12"), editadoPor: "Ana Ríos"
  }
];

export const proyectos: Proyecto[] = [
  { id: "PR001", nombre: "App Pensiones V3", tipo: "Entrevista virtual", estado: "En campo", participantes: 6, cuota: 8, responsable: "Ana Ríos", inicio: "2025-01-15", fin: "2025-01-28", objetivo: "Evaluar la experiencia de usuario del nuevo flujo de simulación de pensiones voluntarias en la app móvil. Identificar puntos de fricción en el proceso de aporte adicional y validar la comprensión de los proyecciones financieras.", enlace: "https://teams.microsoft.com/l/meetup-join/pensionesv3" },
  { id: "PR005", nombre: "Akaunt Rediseño", tipo: "Test remoto", estado: "Reclutando", participantes: 2, cuota: 6, responsable: "Carlos Muñoz", inicio: "2025-01-20", fin: "2025-02-05", objetivo: "Validar el nuevo diseño del portal Akaunt con usuarios reales. Medir la tasa de éxito en tareas clave como consulta de saldo, movimientos y descarga de certificados.", enlace: "https://app.useberry.com/t/akaunt-redesign" },
  { id: "PR003", nombre: "Portal Contigo", tipo: "Entrevista virtual", estado: "Cerrado", participantes: 5, cuota: 5, responsable: "María López", inicio: "2024-11-10", fin: "2024-11-25", objetivo: "Entender las necesidades de los usuarios del portal Contigo para el rediseño de la experiencia de autogestión de productos." }
];

function generateBonos(): Bono[] {
  const bonos: Bono[] = [];
  const creacion = new Date("2025-07-23");
  const vencimiento = new Date("2026-03-25");
  for (let i = 1; i <= 20; i++) {
    const estado: Bono["estado"] = i <= 8 ? "Disponible" : i <= 18 ? "Enviado" : "Vencido";
    bonos.push({
      guid: `GUID-${String(i).padStart(4, "0")}`,
      codigo: `JUJU-${String(1000 + i)}`,
      puntos: 15,
      estado,
      fechaCreacion: creacion,
      fechaVencimiento: vencimiento,
      investigacion: estado === "Enviado" ? ["App Pensiones V3", "Portal Contigo", "Akaunt Rediseño"][i % 3] : null,
      participanteNombre: estado === "Enviado" ? ["Ana María García", "Juan David Pérez", "Sofía Ruiz"][i % 3] : null,
      participanteCorreo: estado === "Enviado" ? ["agarcia@gmail.com", "jperez@gmail.com", "sruiz@gmail.com"][i % 3] : null,
      fechaEnvio: estado === "Enviado" ? new Date(`2025-0${1 + (i % 3)}-${10 + i}`) : null,
    });
  }
  return bonos;
}
export const bonos = generateBonos();

export const emailTracking: EmailTracking[] = [
  { id: "ET001", proyectoId: "PR001", participanteId: "P001", participanteNombre: "Juan David Pérez Mora", participanteCorreo: "jperez@gmail.com", plantillaCodigo: "P2", plantillaNombre: "Invitación test remoto", estado: "Abierto", fechaEnvio: new Date("2025-01-16T10:30:00"), fechaApertura: new Date("2025-01-16T11:15:00"), enviadoPor: "Ana Ríos" },
  { id: "ET002", proyectoId: "PR001", participanteId: "P002", participanteNombre: "Ana María García López", participanteCorreo: "agarcia@gmail.com", plantillaCodigo: "P3", plantillaNombre: "Invitación entrevista virtual", estado: "Entregado", fechaEnvio: new Date("2025-01-17T09:00:00"), fechaApertura: null, enviadoPor: "Ana Ríos" },
  { id: "ET003", proyectoId: "PR001", participanteId: "P002", participanteNombre: "Ana María García López", participanteCorreo: "agarcia@gmail.com", plantillaCodigo: "P4", plantillaNombre: "Confirmación y agendamiento", estado: "Abierto", fechaEnvio: new Date("2025-01-18T14:00:00"), fechaApertura: new Date("2025-01-18T14:22:00"), enviadoPor: "Ana Ríos" },
  { id: "ET004", proyectoId: "PR001", participanteId: "P001", participanteNombre: "Juan David Pérez Mora", participanteCorreo: "jperez@gmail.com", plantillaCodigo: "P5", plantillaNombre: "Recordatorio 24h antes", estado: "Enviado", fechaEnvio: new Date("2025-01-19T09:00:00"), fechaApertura: null, enviadoPor: "Ana Ríos" },
  { id: "ET005", proyectoId: "PR001", participanteId: "P003", participanteNombre: "Carlos Andrés Torres Bermúdez", participanteCorreo: "ctorres@gmail.com", plantillaCodigo: "P2", plantillaNombre: "Invitación test remoto", estado: "Fallido", fechaEnvio: new Date("2025-01-16T10:30:00"), fechaApertura: null, enviadoPor: "Ana Ríos" },
  { id: "ET006", proyectoId: "PR005", participanteId: "P004", participanteNombre: "Lucía Fernanda Ramos Castro", participanteCorreo: "lramos@gmail.com", plantillaCodigo: "P2", plantillaNombre: "Invitación test remoto", estado: "Abierto", fechaEnvio: new Date("2025-01-21T11:00:00"), fechaApertura: new Date("2025-01-21T12:30:00"), enviadoPor: "Carlos Muñoz" },
  { id: "ET007", proyectoId: "PR005", participanteId: "P006", participanteNombre: "Sofía Ruiz Palomino", participanteCorreo: "sruiz@gmail.com", plantillaCodigo: "P2", plantillaNombre: "Invitación test remoto", estado: "Entregado", fechaEnvio: new Date("2025-01-21T11:00:00"), fechaApertura: null, enviadoPor: "Carlos Muñoz" },
  { id: "ET008", proyectoId: "PR005", participanteId: "P006", participanteNombre: "Sofía Ruiz Palomino", participanteCorreo: "sruiz@gmail.com", plantillaCodigo: "P4", plantillaNombre: "Confirmación y agendamiento", estado: "Pendiente", fechaEnvio: new Date("2025-01-22T08:00:00"), fechaApertura: null, enviadoPor: "Carlos Muñoz" },
  { id: "ET009", proyectoId: "PR003", participanteId: "P002", participanteNombre: "Ana María García López", participanteCorreo: "agarcia@gmail.com", plantillaCodigo: "P8", plantillaNombre: "Agradecimiento + código de bono", estado: "Abierto", fechaEnvio: new Date("2024-11-26T15:00:00"), fechaApertura: new Date("2024-11-26T16:10:00"), enviadoPor: "María López" },
  { id: "ET010", proyectoId: "PR003", participanteId: "P006", participanteNombre: "Sofía Ruiz Palomino", participanteCorreo: "sruiz@gmail.com", plantillaCodigo: "P7", plantillaNombre: "¿Cuántos puntos tienes?", estado: "Abierto", fechaEnvio: new Date("2024-11-21T10:00:00"), fechaApertura: new Date("2024-11-21T11:45:00"), enviadoPor: "María López" },
];

export const plantillas: Plantilla[] = [
  { id: "T1", codigo: "P1", nombre: "Invitación comunidad de testers", tipo: "Invitación", descripcion: "Se envía al invitar a un nuevo usuario a la comunidad", variables: ["Nombre"], asunto: "Únete a nuestra Comunidad de Testers · Skandia", cuerpo: "Hola [Nombre], en Skandia creemos que las mejores experiencias se construyen contigo. Por eso, te invitamos a ser parte de nuestra Comunidad de Testers, un espacio donde podrás probar antes que nadie las novedades de nuestra app, portal web y productos. ¡Tu voz es clave para diseñar el futuro de las finanzas!" },
  { id: "T2", codigo: "P2", nombre: "Invitación test remoto", tipo: "Invitación", descripcion: "Se envía al inicio del reclutamiento para UseBerry/Maze", variables: ["Nombre", "NombreDiseñador", "descripción", "puntos", "puntosAcumulados"], asunto: "Tu opinión importa — Nuevo testeo disponible", cuerpo: "Hola [Nombre], en Skandia seguimos construyendo nuestras experiencias digitales junto a ti. Soy [NombreDiseñador], parte del equipo de investigación de usuarios. Para nosotros tu opinión es muy importante, por eso queremos invitarte a participar en un nuevo testeo sobre [descripción]. Solo por realizarlo, sumas [puntos] puntos en nuestra comunidad de testers." },
  { id: "T3", codigo: "P3", nombre: "Invitación entrevista virtual", tipo: "Invitación", descripcion: "Para agendar sesión de 30 min por Teams", variables: ["Nombre", "NombreDiseñador", "producto/funcionalidad", "fechas sugeridas"], asunto: "Sesión de diseño — te necesitamos 30 minutos", cuerpo: "Hola [Nombre], mi nombre es [NombreDiseñador] y formo parte del equipo de Experiencia de Usuario (UX). Te escribo porque nos gustaría que participes en el proceso de mejora de [producto/funcionalidad]." },
  { id: "T4", codigo: "P4", nombre: "Confirmación y agendamiento", tipo: "Confirmación", descripcion: "Confirma fecha, hora y enlace de la sesión", variables: ["Nombre", "fecha", "hora", "enlace Teams"], asunto: "Confirmado — Tu sesión con el equipo UX de Skandia", cuerpo: "¡Hola [Nombre]! Quedó confirmada tu sesión para el [fecha] a las [hora]. Aquí el enlace para conectarte: [enlace Teams]. Te esperamos." },
  { id: "T5", codigo: "P5", nombre: "Recordatorio 24h antes", tipo: "Recordatorio", descripcion: "Recordatorio un día antes de la sesión", variables: ["Nombre", "hora", "enlace Teams"], asunto: "Mañana tienes sesión con el equipo UX · Recordatorio", cuerpo: "Hola [Nombre], te recordamos que mañana a las [hora] tienes programada tu sesión. [enlace Teams]" },
  { id: "T6", codigo: "P6", nombre: "Recordatorio 1h antes", tipo: "Recordatorio", descripcion: "Recordatorio una hora antes", variables: ["Nombre", "enlace Teams"], asunto: "En 1 hora — Tu sesión de hoy con Skandia", cuerpo: "Hola [Nombre], en una hora comienza tu sesión. Aquí el enlace directo: [enlace Teams]" },
  { id: "T7", codigo: "P7", nombre: "¿Cuántos puntos tienes?", tipo: "Seguimiento", descripcion: "Informa al participante sus puntos acumulados", variables: ["Nombre", "puntosActuales", "puntasFaltantes"], asunto: "¡Gracias! Ya tienes [puntosActuales] puntos en la comunidad", cuerpo: "¡Hola [Nombre]! Gracias por tu retroalimentación. Completaste esta actividad y acumulaste [puntosActuales] puntos. Te faltan [puntasFaltantes] para recibir tu bono de $30.000." },
  { id: "T8", codigo: "P8", nombre: "Agradecimiento + código de bono", tipo: "Agradecimiento", descripcion: "Se envía cuando el participante completa 30 puntos", variables: ["Nombre", "codigoBono", "link redención"], asunto: "¡Ganaste un bono de $30.000! 🎉", cuerpo: '¡Hola [Nombre]! Gracias por tu retroalimentación en los testeos y encuestas. ¡Completaste 30 puntos y ganaste un bono de $30.000! Para redimirlo: da clic en [link redención], en el campo "ingresa tu código" escribe: [codigoBono].' },
];

export const actividadReciente: ActividadReciente[] = [
  { accion: "Correo enviado", participante: "Juan David Pérez", disenador: "Ana Ríos", tiempo: "Hace 2h" },
  { accion: "Participante agregado", participante: "Sofía Ruiz", disenador: "Carlos Muñoz", tiempo: "Ayer" },
  { accion: "Bono enviado (P8)", participante: "Ana García", disenador: "Ana Ríos", tiempo: "Hace 3 días" },
  { accion: "Proyecto creado", participante: "—", disenador: "María López", tiempo: "Hace 5 días" },
  { accion: "Perfil actualizado", participante: "Carlos Torres", disenador: "Ana Ríos", tiempo: "Hace 1 semana" },
];
