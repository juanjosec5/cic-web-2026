import type { StructureResolver } from 'sanity/structure';

/** Types listed explicitly below; everything else falls through the catch-all. */
const EXPLICIT_TYPES = ['paginaInicio', 'sede', 'perfil', 'promocionMes', 'pagina'];

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenido')
    .items([
      S.listItem()
        .title('Página de Inicio')
        .id('paginaInicio')
        .child(S.document().schemaType('paginaInicio').documentId('paginaInicio')),
      S.documentTypeListItem('sede').title('Sedes'),
      S.documentTypeListItem('perfil').title('Perfiles de exámenes'),
      S.documentTypeListItem('promocionMes').title('Promoción del Mes'),
      S.listItem()
        .title('Páginas')
        .id('paginas')
        .child(
          S.documentTypeList('pagina')
            .title('Páginas')
            .defaultOrdering([{ field: 'ruta', direction: 'asc' }]),
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (li) => !EXPLICIT_TYPES.includes(li.getId() ?? ''),
      ),
    ]);
