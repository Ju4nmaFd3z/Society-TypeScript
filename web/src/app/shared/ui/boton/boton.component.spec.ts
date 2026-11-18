import { TestBed } from '@angular/core/testing';
import { BotonComponent } from './boton.component';

describe('BotonComponent', () => {
  it('el primario lleva la clase boton-primario', () => {
    const fixture = TestBed.createComponent(BotonComponent);
    fixture.detectChanges();

    const boton: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(boton.className).toContain('boton-primario');
  });

  it('el secundario lleva las clases boton-secundario y cristal-claro', () => {
    const fixture = TestBed.createComponent(BotonComponent);
    fixture.componentInstance.variante = 'secundario';
    fixture.detectChanges();

    const boton: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(boton.className).toContain('boton-secundario');
    expect(boton.className).toContain('cristal-claro');
  });
});
