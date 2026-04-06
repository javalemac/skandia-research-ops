import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Convierte un valor (Date o ISO string) a un objeto Date válido
 */
export const toDate = (d: any): Date | null => {
  if (!d) return null;
  if (d instanceof Date && isValid(d)) return d;
  if (typeof d === "string") {
    const parsed = parseISO(d);
    return isValid(parsed) ? parsed : null;
  }
  return null;
};

/**
 * Formatea una fecha de forma segura (soporta Date e ISO string)
 */
export const safeFormatDate = (d: any, formatStr: string = "dd MMM yyyy"): string => {
  const date = toDate(d);
  if (!date) return "—";
  return format(date, formatStr, { locale: es });
};

/**
 * Formatea fecha y hora de forma segura
 */
export const safeFormatDateTime = (d: any): string => {
  const date = toDate(d);
  if (!date) return "—";
  return format(date, "dd MMM yyyy '·' HH:mm", { locale: es });
};

/**
 * Compara dos fechas de forma segura (para sort)
 */
export const safeCompareDates = (a: any, b: any, desc: boolean = true): number => {
  const dateA = toDate(a);
  const dateB = toDate(b);
  
  const timeA = dateA ? dateA.getTime() : 0;
  const timeB = dateB ? dateB.getTime() : 0;
  
  return desc ? timeB - timeA : timeA - timeB;
};
