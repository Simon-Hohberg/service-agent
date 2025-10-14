import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceCallList } from './service-call-list';

describe('ServiceCallList', () => {
  let component: ServiceCallList;
  let fixture: ComponentFixture<ServiceCallList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceCallList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceCallList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
