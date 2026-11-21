import { env } from './env';
import { DEPENDENCIAS } from './catalogoAreas';
import { AreaModel } from '../modules/areas/areas.model';
import { UserModel } from '../modules/auth/auth.model';
import { sincronizarCatalogos } from '../modules/catalogos/catalogos.model';

/**
 * Sincroniza las 21 áreas oficiales y crea (solo si no existen) las cuentas
 * iniciales: una por área + la cuenta de Administrador.
 * Es idempotente: nunca sobrescribe contraseñas ni correos ya cambiados.
 */
export const bootstrapCuentas = async () => {
  let creadas = 0;

  for (const dep of DEPENDENCIAS) {
    const area = await AreaModel.findOneAndUpdate(
      { nombre: dep.nombre },
      { $set: { nombre: dep.nombre, siglas: dep.siglas } },
      { upsert: true, new: true }
    );

    const existe = await UserModel.exists({ area: area._id, rol: { $ne: 'SUPERADMIN' } });
    if (!existe) {
      await UserModel.create({
        nombre: dep.nombre,
        email: dep.email,
        password: env.INITIAL_AREA_PASSWORD,
        rol: 'DIRECTOR_AREA',
        area: area._id,
        debeCambiarPassword: true,
      });
      creadas += 1;
    }
  }

  const adminExiste = await UserModel.exists({ rol: 'SUPERADMIN' });
  if (!adminExiste) {
    await UserModel.create({
      nombre: 'Administrador',
      email: env.ADMIN_EMAIL,
      password: env.ADMIN_PASSWORD,
      rol: 'SUPERADMIN',
      debeCambiarPassword: true,
    });
    creadas += 1;
  }

  console.log(`Catálogo de ${DEPENDENCIAS.length} áreas sincronizado · ${creadas} cuenta(s) nueva(s)`);

  const nuevosValores = await sincronizarCatalogos();
  console.log(`Catálogos de solicitud sincronizados · ${nuevosValores} valor(es) nuevo(s)`);
};
