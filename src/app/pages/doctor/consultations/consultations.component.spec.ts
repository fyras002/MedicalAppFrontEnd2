import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationsComponent } from './consultations.component';

describe('ConsultationsComponent', () => {
  let component: ConsultationsComponent;
  let fixture: ComponentFixture<ConsultationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultationsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultationsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
