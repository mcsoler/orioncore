/** Error base del dominio: reglas de negocio violadas. */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
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
