import { Injectable } from '@angular/core';

// Una cuenta de la sesión simulada: su correo y si ya dio de alta su local
interface Cuenta {
  correo: string;
  altaCompletada: boolean;
}

// PROVISIONAL: sesión de mentira hasta que la web use la API de autenticación.
// No guarda contraseñas y se pierde al recargar la página.
@Injectable({ providedIn: 'root' })
export class SesionSimuladaService {
  // Cuenta de ejemplo con el local ya dado de alta
  private cuentas: Cuenta[] = [{ correo: 'local@ejemplo.es', altaCompletada: true }];

  // Cuenta con la que se ha entrado; null si no hay sesión
  private cuentaActual: Cuenta | null = null;

  haySesion(): boolean {
    return this.cuentaActual !== null;
  }

  altaCompletada(): boolean {
    return this.cuentaActual !== null && this.cuentaActual.altaCompletada;
  }

  // Devuelve false si el correo no existe
  iniciarSesion(correo: string): boolean {
    const cuenta = this.buscarCuenta(correo);
    if (!cuenta) {
      return false;
    }
    this.cuentaActual = cuenta;
    return true;
  }

  // Devuelve false si el correo ya tiene cuenta
  registrar(correo: string): boolean {
    if (this.buscarCuenta(correo)) {
      return false;
    }
    const nueva: Cuenta = { correo: correo.toLowerCase(), altaCompletada: false };
    this.cuentas.push(nueva);
    this.cuentaActual = nueva;
    return true;
  }

  // Se llama al confirmar la ficha (S04); a partir de aquí se entra al resumen
  completarAlta(): void {
    if (this.cuentaActual) {
      this.cuentaActual.altaCompletada = true;
    }
  }

  cerrarSesion(): void {
    this.cuentaActual = null;
  }

  // Ruta a la que se va al entrar, según si el local ya está dado de alta
  rutaDeInicio(): string {
    return this.altaCompletada() ? '/resumen' : '/alta/buscar';
  }

  private buscarCuenta(correo: string): Cuenta | undefined {
    return this.cuentas.find((cuenta) => cuenta.correo === correo.toLowerCase());
  }
}
