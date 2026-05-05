const SEDE_PROJECTION = `{
  "slug": slug.current,
  nombre,
  ciudad,
  direccion,
  lat,
  lng,
  telefono,
  whatsapp,
  email,
  horario,
  servicios,
  "fotos": fotos[].asset->url,
  video,
  convenios,
  domicilioGratisDesde,
  esSedePrincipal,
  mapEmbedUrl,
}`;

export const ALL_SEDES_QUERY = `
  *[_type == "sede"] | order(esSedePrincipal desc, nombre asc) ${SEDE_PROJECTION}
`;

export const SEDE_BY_SLUG_QUERY = `
  *[_type == "sede" && slug.current == $slug][0] ${SEDE_PROJECTION}
`;

export const PROMO_MES_QUERY = `
  *[_type == "promocionMes" && activo == true] | order(mesAño desc) [0] {
    titulo,
    descripcion,
    modo,
    "imagenCompletaUrl": imagenCompleta.asset->url,
    "imagenFondoUrl": imagenFondo.asset->url,
    colorFondo,
    ctaTexto,
    ctaUrl,
  }
`;
