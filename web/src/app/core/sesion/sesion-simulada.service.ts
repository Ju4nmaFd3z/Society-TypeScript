import { Injectable, computed, signal } from '@angular/core';

export type MotivoError = 'credenciales' | 'correo-registrado' | 'demasiados-intentos' | 'sin-conexion';

export type ResultadoAcceso = { ok: true; destino: string } | { ok: false; motivo: MotivoError };

/** Correo de la cuenta de ejemplo que ya tiene el local dado de alta. */
export const CORREO_DE_EJEMPLO = 'local@ejemplo.es';

const INTENTOS_MAXIMOS = 5;
const RETRASO_MS = 400;

/**
 * PROVISIONAL (SOCIETY-55): sesión con datos simulados, a la espera de la API de autenticación.
 *
 * - No recibe ni guarda la contraseña: la real nunca se guarda en la app ni en los registros.
 * - Solo existe en memoria: al recargar la página se pierde la sesión.
 * - Cuentas conocidas: `CORREO_DE_EJEMPLO` (con el alta completada) y las que se creen en esta sesión
 *   del navegador (con el alta pendiente).
 * - Cualquier correo desconocido da «credenciales incorrectas».
 */
@Injectable({ providedIn: 'root' })
export class SesionSimuladaService {
  private readonly cuentas = new Map<string, boolean>([[CORREO_DE_EJEMPLO, true]]);
  private intentosFallidos = 0;

  private readonly _correo = signal<string | null>(null);
  private readonly _altaCompletada = signal(false);

  readonly correo = this._correo.asReadonly();
  readonly autenticada = computed(() => this._correo() !== null);
  readonly altaCompletada = this._altaCompletada.asReadonly();

  /** Ruta a la que va la persona según el estado del alta de su local. */
  destinoInicial(): string {
    return this._altaCompletada() ? '/resumen' : '/alta/buscar';
  }

  async registrar(correo: string): Promise<ResultadoAcceso> {
    await this.esperar();
    if (!this.hayConexion()) return { ok: false, motivo: 'sin-conexion' };
    const clave = this.normalizar(correo);
    if (this.cuentas.has(clave)) return { ok: false, motivo: 'correo-registrado' };
    this.cuentas.set(clave, false);
    this.abrir(clave, false);
    return { ok: true, destino: this.destinoInicial() };
  }

  async iniciarSesion(correo: string): Promise<ResultadoAcceso> {
    await this.esperar();
    if (!this.hayConexion()) return { ok: false, motivo: 'sin-conexion' };
    if (this.intentosFallidos >= INTENTOS_MAXIMOS) return { ok: false, motivo: 'demasiados-intentos' };
    const clave = this.normalizar(correo);
    const alta = this.cuentas.get(clave);
    if (alta === undefined) {
      this.intentosFallidos++;
      return { ok: false, motivo: 'credenciales' };
    }
    this.abrir(clave, alta);
    return { ok: true, destino: this.destinoInicial() };
  }

  /** El alta del local termina en las pantallas 02 a 04 (aún sin hacer). */
  completarAlta(): void {
    const correo = this._correo();
    if (correo === null) return;
    this.cuentas.set(correo, true);
    this._altaCompletada.set(true);
  }

  cerrarSesion(): void {
    this._correo.set(null);
    this._altaCompletada.set(false);
  }

  private abrir(correo: string, alta: boolean): void {
    this.intentosFallidos = 0;
    this._correo.set(correo);
    this._altaCompletada.set(alta);
  }

  private normalizar(correo: string): string {
    return correo.trim().toLowerCase();
  }

  private hayConexion(): boolean {
    return typeof navigator === 'undefined' || navigator.onLine;
  }

  private esperar(): Promise<void> {
    return new Promise((resolver) => setTimeout(resolver, RETRASO_MS));
  }
}
