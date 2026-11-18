import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SesionSimuladaService } from '../../core/sesion/sesion-simulada.service';
import { AccesoComponent } from './acceso.component';

describe('AccesoComponent', () => {
  beforeEach(() => {
    // Router con una ruta que lo acepta todo, para que la navegación no falle
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', children: [] }])],
    });
  });

  it('con el formulario vacío muestra los errores', () => {
    const fixture = TestBed.createComponent(AccesoComponent);
    fixture.componentInstance.enviar();
    fixture.detectChanges();

    const texto: string = fixture.nativeElement.textContent;
    expect(texto).toContain('Escribe tu correo electrónico.');
    expect(texto).toContain('Escribe tu contraseña.');
    expect(texto).toContain('tienes que aceptar los términos');
  });

  it('inicia sesión con la cuenta de ejemplo', () => {
    const fixture = TestBed.createComponent(AccesoComponent);
    const acceso = fixture.componentInstance;

    acceso.cambiarModo('entrar');
    acceso.formulario.setValue({ correo: 'local@ejemplo.es', contrasena: '12345678', terminos: false });
    acceso.enviar();

    expect(TestBed.inject(SesionSimuladaService).haySesion()).toBeTrue();
  });

  it('si el correo ya tiene cuenta, pasa a «Iniciar sesión»', () => {
    const fixture = TestBed.createComponent(AccesoComponent);
    const acceso = fixture.componentInstance;

    acceso.formulario.setValue({ correo: 'local@ejemplo.es', contrasena: '12345678', terminos: true });
    acceso.enviar();

    expect(acceso.modo).toBe('entrar');
    expect(acceso.mensajeError).toContain('ya tiene una cuenta');
  });
});
