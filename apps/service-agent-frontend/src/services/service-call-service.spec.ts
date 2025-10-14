import { TestBed } from '@angular/core/testing';

import { ServiceCallService } from './service-call-service';

describe('ServiceCallService', () => {
  let service: ServiceCallService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceCallService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
