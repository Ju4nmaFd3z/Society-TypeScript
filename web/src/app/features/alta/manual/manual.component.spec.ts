import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { SesionSimuladaService } from '../../../core/sesion/sesion-simulada.service';
import { AltaSimuladaService } from '../alta-simulada.service';
import { ManualComponent } from './manual.component';

describe('ManualComponent', () => {
  beforeEach(() => {
    // Router con una ruta que lo acepta todo, para que la navegación no falle
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', children: [] }]), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  function rellenar(manual: ManualComponent): void {
    manual.formulario.setValue({
      nombre: '  Bar La Esquina  ',
      tipo: 'BAR',
      direccion: ' Calle Granada 4 ',
      municipio: ' Málaga ',
      web: 'https://laesquina.es',
      instagram: '@Bar.LaEsquina',
      declaraGestor: true,
    });
  }

  it('con el formulario vacío muestra los errores', () => {
    const fixture = TestBed.createComponent(ManualComponent);
    fixture.componentInstance.guardar();
    fixture.detectChanges();

    const texto: string = fixture.nativeElement.textContent;
    expect(texto).toContain('Escribe el nombre del local.');
    expect(texto).toContain('Elige el tipo de local.');
    expect(texto).toContain('Escribe la dirección.');
    expect(texto).toContain('Escribe el municipio.');
    expect(texto).toContain('tienes que declarar que lo gestionas');
  });

  it('rechaza una web sin https:// y un Instagram con caracteres no válidos', () => {
    const fixture = TestBed.createComponent(ManualComponent);
    const manual = fixture.componentInstance;
    rellenar(manual);
    manual.formulario.patchValue({ web: 'http://laesquina.es', instagram: 'bar esquina' });
    manual.guardar();

    expect(manual.errorWeb).toContain('https://');
    expect(manual.errorInstagram).toContain('letras, números');
    expect(manual.guardando).toBeFalse();
  });

  it('recorta los espacios, guarda el Instagram sin @ y en minúsculas y va al análisis', fakeAsync(() => {
    TestBed.inject(SesionSimuladaService).registrar('nuevo@ejemplo.es');
    const crear = spyOn(TestBed.inject(AltaSimuladaService), 'crear').and.callThrough();
    const navegar = spyOn(TestBed.inject(Router), 'navigateByUrl');
    const fixture = TestBed.createComponent(ManualComponent);
    const manual = fixture.componentInstance;

    rellenar(manual);
    manual.guardar();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBeTrue();

    tick(500);
    expect(crear).toHaveBeenCalledWith({
      origen: 'MANUAL',
      nombre: 'Bar La Esquina',
      direccion: 'Calle Granada 4',
      municipio: 'Málaga',
      tipo: 'BAR',
      web: 'https://laesquina.es',
      instagram: 'bar.laesquina',
      declaraGestor: true,
    });
    expect(navegar.calls.mostRecent().args[0]).toMatch(/^\/alta\/analisis\/.+/);
  }));

  it('si la cuenta ya tiene local avisa con «Ya tienes un local»', fakeAsync(() => {
    TestBed.inject(SesionSimuladaService).iniciarSesion('local@ejemplo.es');
    const fixture = TestBed.createComponent(ManualComponent);
    const manual = fixture.componentInstance;

    rellenar(manual);
    manual.guardar();
    tick(500);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Ya tienes un local.');
  }));
});
