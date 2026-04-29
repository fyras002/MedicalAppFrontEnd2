import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialitiesComponent } from './specialities.component';

describe('SpecialitiesComponent', () => {
  let component: SpecialitiesComponent;
  let fixture: ComponentFixture<SpecialitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialitiesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpecialitiesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
