const SEDE_PROJECTION = `{
  "slug": slug.current,
  nombre,
  ciudad,
  direccion,
  lat,
  lng,
  telefono,
  whatsapp,
  whatsappDomicilio,
  whatsappSubgerencia,
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
    "imagenes": coalesce(imagenes[]{
      "url": imagen.asset->url,
      "linkUrl": url
    }, []),
    "imagenFondoUrl": imagenFondo.asset->url,
    colorFondo,
    ctaTexto,
    ctaUrl,
  }
`;

export const SEDE_PRINCIPAL_MAP_QUERY = `
  *[_type == "sede" && esSedePrincipal == true][0] { mapEmbedUrl }
`;

export const ALL_PERFILES_QUERY = `
  *[_type == "perfil"] | order(precio asc) {
    "slug": slug.current,
    nombre,
    descripcion,
    categoria,
    "imagenPortadaUrl": imagenPortada.asset->url,
    "examenesIncluidos": coalesce(examenesIncluidos[] { nombre, slug }, []),
    precio,
  }
`;

export const PAGINAS_QUERY = `
  *[_type == "pagina"] {
    "ruta": ruta,
    titulo,
    "banner": select(
      banner.activo == true => {
        "alt": banner.alt,
        "enlace": banner.enlace,
        "desktopUrl": banner.imagenDesktop.asset->url,
        "desktopW": banner.imagenDesktop.asset->metadata.dimensions.width,
        "desktopH": banner.imagenDesktop.asset->metadata.dimensions.height,
        "mobileUrl": banner.imagenMobile.asset->url,
        "mobileW": banner.imagenMobile.asset->metadata.dimensions.width,
        "mobileH": banner.imagenMobile.asset->metadata.dimensions.height,
      },
      null
    ),
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
    "equipoImagenes": coalesce(equipoImagenes[].asset->url, []),
    "testimonios": coalesce(testimonios[] { texto, nombre, ciudad, cargo }, []),
  }
`;
