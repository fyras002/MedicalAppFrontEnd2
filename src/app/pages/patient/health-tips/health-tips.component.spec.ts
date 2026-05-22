import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthTipsComponent } from './health-tips.component';

describe('HealthTipsComponent', () => {
  let component: HealthTipsComponent;
  let fixture: ComponentFixture<HealthTipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthTipsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HealthTipsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
