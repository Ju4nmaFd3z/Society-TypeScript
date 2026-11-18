import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { CORREO_DE_EJEMPLO } from '../../core/sesion/sesion-simulada.service';
import { AccesoComponent } from './acceso.component';

describe('AccesoComponent (S01A)', () => {
  let fixture: ComponentFixture<AccesoComponent>;
  let raiz: HTMLElement;
  let router: Router;

  const campo = (etiqueta: string) =>
    Array.from(raiz.querySelectorAll('app-campo-cristal')).find((c) => c.textContent?.includes(etiqueta))!.querySelector('input')!;
  const casilla = () => raiz.querySelector<HTMLInputElement>('app-casilla input')!;
  const boton = () => raiz.querySelector<HTMLButtonElement>('button[type=submit]')!;
  const pestana = (texto: string) =>
    Array.from(raiz.querySelectorAll<HTMLButtonElement>('[role=tab]')).find((b) => b.textContent?.includes(texto))!;

  function escribir(input: HTMLInputElement, valor: string): void {
    input.value = valor;
    input.dispatchEvent(new Event('input'));
  }
  function marcar(valor: boolean): void {
    const c = casilla();
    c.checked = valor;
    c.dispatchEvent(new Event('change'));
  }
  function enviar(): void {
    boton().click();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AccesoComponent], providers: [provideRouter([])] }).compileComponents();
    fixture = TestBed.createComponent(AccesoComponent);
    router = TestBed.inject(Router);
    raiz = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('empieza en «Crear cuenta» con la casilla de términos', () => {
    expect(pestana('Crear cuenta').getAttribute('aria-selected')).toBe('true');
    expect(casilla()).toBeTruthy();
    expect(raiz.textContent).toContain('Acepto los términos y la política de privacidad');
  });

  it('con el formulario vacío muestra los errores de cada campo y no navega', () => {
    const navegar = spyOn(router, 'navigateByUrl');
    enviar();
    expect(raiz.textContent).toContain('Escribe tu correo electrónico.');
    expect(raiz.textContent).toContain('Escribe tu contraseña.');
    expect(raiz.textContent).toContain('aceptar los términos');
    expect(navegar).not.toHaveBeenCalled();
  });

  it('valida el formato del correo, los 254 caracteres y los 8 de la contraseña', () => {
    escribir(campo('Correo'), 'no-es-un-correo');
    escribir(campo('Contraseña'), '1234567');
    enviar();
    expect(raiz.textContent).toContain('Escribe un correo válido');
    expect(raiz.textContent).toContain('al menos 8 caracteres');
    // Formato válido (etiquetas de 60 letras) pero de 308 caracteres
    escribir(campo('Correo'), 'a@' + ('b'.repeat(60) + '.').repeat(5) + 'es');
    fixture.detectChanges();
    expect(raiz.textContent).toContain('254 caracteres');
  });

  it('la contraseña se puede mostrar y ocultar', () => {
    expect(campo('Contraseña').type).toBe('password');
    raiz.querySelector<HTMLButtonElement>('[campoAccion]')!.click();
    fixture.detectChanges();
    expect(campo('Contraseña').type).toBe('text');
  });

  it('«Iniciar sesión» no pide la casilla de términos', () => {
    pestana('Iniciar sesión').click();
    fixture.detectChanges();
    expect(raiz.querySelector('app-casilla')).toBeNull();
    escribir(campo('Correo'), 'alguien@ejemplo.es');
    escribir(campo('Contraseña'), '12345678');
    enviar();
    expect(raiz.textContent).not.toContain('aceptar los términos');
  });

  it('crear cuenta con datos válidos pasa por «Enviando…» y va a /alta/buscar', fakeAsync(() => {
    const navegar = spyOn(router, 'navigateByUrl').and.resolveTo(true);
    escribir(campo('Correo'), 'nuevo@ejemplo.es');
    escribir(campo('Contraseña'), '12345678');
    marcar(true);
    enviar();
    expect(boton().textContent).toContain('Enviando');
    expect(boton().disabled).toBeTrue();
    tick(400);
    expect(navegar).toHaveBeenCalledWith('/alta/buscar');
  }));

  it('iniciar sesión con la cuenta de ejemplo va a /resumen', fakeAsync(() => {
    const navegar = spyOn(router, 'navigateByUrl').and.resolveTo(true);
    pestana('Iniciar sesión').click();
    fixture.detectChanges();
    escribir(campo('Correo'), CORREO_DE_EJEMPLO);
    escribir(campo('Contraseña'), '12345678');
    enviar();
    tick(400);
    expect(navegar).toHaveBeenCalledWith('/resumen');
  }));

  it('credenciales incorrectas muestran el aviso y no navegan', fakeAsync(() => {
    const navegar = spyOn(router, 'navigateByUrl');
    pestana('Iniciar sesión').click();
    fixture.detectChanges();
    escribir(campo('Correo'), 'nadie@ejemplo.es');
    escribir(campo('Contraseña'), '12345678');
    enviar();
    tick(400);
    fixture.detectChanges();
    expect(raiz.querySelector('[role=alert]')?.textContent).toContain('no son correctos');
    expect(navegar).not.toHaveBeenCalled();
  }));

  it('un correo ya registrado cambia la pantalla a «Iniciar sesión»', fakeAsync(() => {
    escribir(campo('Correo'), CORREO_DE_EJEMPLO);
    escribir(campo('Contraseña'), '12345678');
    marcar(true);
    enviar();
    tick(400);
    fixture.detectChanges();
    expect(pestana('Iniciar sesión').getAttribute('aria-selected')).toBe('true');
    expect(raiz.textContent).toContain('Ese correo ya tiene una cuenta');
  }));

  it('sin conexión muestra «Revisa tu conexión» y «Reintentar» vuelve a enviar', fakeAsync(() => {
    const enLinea = spyOnProperty(navigator, 'onLine').and.returnValue(false);
    const navegar = spyOn(router, 'navigateByUrl').and.resolveTo(true);
    escribir(campo('Correo'), 'nuevo2@ejemplo.es');
    escribir(campo('Contraseña'), '12345678');
    marcar(true);
    enviar();
    tick(400);
    fixture.detectChanges();
    expect(raiz.textContent).toContain('Revisa tu conexión');
    enLinea.and.returnValue(true);
    Array.from(raiz.querySelectorAll<HTMLButtonElement>('app-estado-error button'))
      .find((b) => b.textContent?.includes('Reintentar'))!
      .click();
    tick(400);
    expect(navegar).toHaveBeenCalledWith('/alta/buscar');
  }));
});
