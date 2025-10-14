import { inject, Injectable } from '@angular/core';
import { UserService } from './user-service.js';
import { environment } from '../environments/environment.js';
import { httpResource } from '@angular/common/http';
import { GetServiceCalls } from 'common';

@Injectable({
  providedIn: 'root',
})
export class ServiceCallService {
  private userService = inject(UserService);

  serviceCalls = httpResource<GetServiceCalls[]>(() => ({
    url: `${environment.apiUrl}/${this.userService.currentTenant()}/serviceCalls`,
    method: 'GET',
  }));
}
