import { inject, Injectable } from '@angular/core';
import { UserService } from './user-service.js';
import { environment } from '../environments/environment.js';
import { HttpClient, httpResource } from '@angular/common/http';
import { GetServiceCalls } from 'common';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServiceCallService {
  private userService = inject(UserService);
  private http = inject(HttpClient);

  serviceCalls = httpResource<GetServiceCalls>(() => ({
    url: `${environment.apiUrl}/tenant/${this.userService.currentTenant()}/serviceCalls`,
    method: 'GET',
    headers: { 'x-user-id': this.userService.userId() },
  }));

  getServiceCalls() {
    return this.http.get<GetServiceCalls>(
      `${environment.apiUrl}/tenant/${this.userService.currentTenant()}/serviceCalls`,
      {
        headers: { 'x-user-id': this.userService.userId() },
      }
    );
  }

  async addFavorite(id: number) {
    await lastValueFrom(
      this.http.put(
        `${
          environment.apiUrl
        }/tenant/${this.userService.currentTenant()}/serviceCall/${id}/favorite`,
        {},
        { headers: { 'x-user-id': this.userService.userId() } }
      )
    );
    this.serviceCalls.reload();
  }

  async removeFavorite(id: number) {
    await lastValueFrom(
      this.http.delete(
        `${
          environment.apiUrl
        }/tenant/${this.userService.currentTenant()}/serviceCall/${id}/favorite`,
        { headers: { 'x-user-id': this.userService.userId() } }
      )
    );
    this.serviceCalls.reload();
  }
}
