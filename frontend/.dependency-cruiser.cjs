// Reglas de la arquitectura hexagonal: ui → application → domain.
// Los patrones aceptan cualquier prefijo para poder probarlas con fixtures
// (tests/unit/architecture.test.ts).
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'domain-is-pure',
      severity: 'error',
      comment: 'El dominio no depende de nada externo: ni Astro, ni React, ni el DOM, ni otras capas.',
      from: { path: '(^|/)src/domain/' },
      to: { pathNot: '(^|/)src/domain/' },
    },
    {
      name: 'application-depends-only-on-domain',
      severity: 'error',
      comment: 'La aplicación solo conoce el dominio y sus propios puertos.',
      from: { path: '(^|/)src/application/' },
      to: { pathNot: '(^|/)src/(application|domain)/' },
    },
    {
      name: 'adapters-only-in-composition-root',
      severity: 'error',
      comment: 'Solo composition/container.ts instancia adaptadores de infraestructura.',
      from: { pathNot: '(^|/)src/(composition|infrastructure)/' },
      to: { path: '(^|/)src/infrastructure/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.json' },
    exclude: { path: '\\.d\\.ts$' },
  },
};
