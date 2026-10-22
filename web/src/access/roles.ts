import type { Access, FieldAccess } from 'payload'

// Mientras no lleguen los roles del panel (entrega 4), toda sesión iniciada administra
// todo, como hasta ahora. Las colecciones ya usan estos nombres para que, al llegar
// los roles, solo cambie este archivo.
export const esAdmin = (user: unknown): boolean => Boolean(user)

export const soloAdmin: Access = ({ req: { user } }) => esAdmin(user)

export const conSesion: Access = ({ req: { user } }) => Boolean(user)

export const adminOPropio: Access = ({ req: { user } }) => esAdmin(user)

export const campoSoloAdmin: FieldAccess = ({ req: { user } }) => esAdmin(user)
