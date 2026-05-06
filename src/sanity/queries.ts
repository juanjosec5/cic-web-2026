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
  "horario": coalesce(horario, {}),
  "servicios": coalesce(servicios, []),
  "fotos": coalesce(fotos[].asset->url, []),
  video,
  "convenios": coalesce(convenios, []),
  domicilioGratisDesde,
  esSedePrincipal,
  mapEmbedUrl,
}`;

export const ALL_SEDES_QUERY = `
  *[_type == "sede"] | order(esSedePrincipal desc, nombre asc) ${SEDE_PROJECTION}
`;


export const PROMO_MES_QUERY = `
  *[_type == "promocionMes" && activo == true] | order(mes desc) [0] {
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

export const PAGINA_INICIO_QUERY = `
  *[_type == "paginaInicio"][0] {
    heroTitulo, heroSubtitulo,
    heroCta1Label, heroCta1Url,
    heroCta2Label, heroCta2Url,
    heroCtaWaLabel,
    pilares[] { titulo, descripcion },
    audiencias[] { titulo, descripcion, "links": coalesce(links[] { label, url }, []) },
    calidad[] { titulo, descripcion, linkLabel, linkUrl },
    "testimonios": coalesce(testimonios[] { texto, nombre, ciudad, cargo }, []),
  }
`;
