/** Error base del dominio: reglas de negocio violadas. */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** Se pidió una URL que no está en el RouteRegistry. */
export class RouteNotFoundError extends DomainError {
  constructor(readonly path: string) {
    super(`La ruta ${path} no existe en el RouteRegistry`);
  }
}

/** Un value object o entidad recibió un valor que no cumple sus reglas. */
export class InvalidValueError extends DomainError {
  constructor(
    readonly field: string,
    message: string,
  ) {
    super(`${field}: ${message}`);
  }
}
