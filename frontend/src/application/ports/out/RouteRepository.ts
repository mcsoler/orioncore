import type { SiteRouteProps } from '../../../domain/entities/SiteRoute';

/** Puerto de salida: de dónde salen las rutas del sitio y su estado (draft/published). */
export interface RouteRepository {
  getRoutes(): SiteRouteProps[];
}
