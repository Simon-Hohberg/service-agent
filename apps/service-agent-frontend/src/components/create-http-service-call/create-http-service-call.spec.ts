import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateHttpServiceCall } from './create-http-service-call';

describe('CreateHttpServiceCall', () => {
  let component: CreateHttpServiceCall;
  let fixture: ComponentFixture<CreateHttpServiceCall>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateHttpServiceCall]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateHttpServiceCall);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
