import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthCourseComponent } from './health-course.component';

describe('HealthCourseComponent', () => {
  let component: HealthCourseComponent;
  let fixture: ComponentFixture<HealthCourseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthCourseComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HealthCourseComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
