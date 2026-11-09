import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PaginaVaciaComponent } from './pagina-vacia.component';

describe('PaginaVaciaComponent', () => {
  let component: PaginaVaciaComponent;
  let fixture: ComponentFixture<PaginaVaciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaVaciaComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginaVaciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
