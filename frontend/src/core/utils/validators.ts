/** Validadores compartidos. Regresan el mensaje de error o null si el valor es válido. */

export const esCorreo = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export const validarCodigoPostal = (v: string) =>
  /^\d{5}$/.test(v.trim()) ? null : 'El código postal debe tener 5 dígitos';

export const validarPassword = (v: string) =>
  v.length >= 8 ? null : 'La contraseña debe tener al menos 8 caracteres';

export const validarEnlaceHttps = (v: string) => {
  try {
    const url = new URL(v.trim());
    return url.protocol === 'https:' ? null : 'El enlace debe empezar con https://';
  } catch {
    return 'El enlace no es una URL válida';
  }
};

/** Mismos formatos y límite que acepta el backend para evidencias. */
export const EVIDENCIA_MAX_MB = 10;
export const EXTENSIONES_EVIDENCIA = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.doc', '.docx', '.xls', '.xlsx'];

export const validarArchivoEvidencia = (archivo: File) => {
  const ext = archivo.name.slice(archivo.name.lastIndexOf('.')).toLowerCase();
  if (!EXTENSIONES_EVIDENCIA.includes(ext)) return `"${archivo.name}": usa PDF, imagen, Word o Excel`;
  if (archivo.size > EVIDENCIA_MAX_MB * 1024 * 1024) return `"${archivo.name}" supera ${EVIDENCIA_MAX_MB} MB`;
  return null;
};
