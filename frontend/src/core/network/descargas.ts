import { AxiosResponse } from 'axios';

/** Nombre del archivo desde Content-Disposition (o el de respaldo). */
const nombreDesdeCabecera = (cabecera: string | undefined, respaldo: string) => {
  if (!cabecera) return respaldo;
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(cabecera);
  if (utf8) return decodeURIComponent(utf8[1]);
  const simple = /filename="?([^";]+)"?/i.exec(cabecera);
  return simple ? simple[1] : respaldo;
};

/** Guarda en el equipo una respuesta de axios con responseType: 'blob'. */
export const guardarBlob = (res: AxiosResponse<Blob>, respaldo: string) => {
  const nombre = nombreDesdeCabecera(res.headers['content-disposition'], respaldo);
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
