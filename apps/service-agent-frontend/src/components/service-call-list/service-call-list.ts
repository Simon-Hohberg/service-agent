import { Component, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { Protocol, ServiceCall } from 'common';
import { ServiceCallService } from '../../services/service-call-service.js';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { UserService } from '../../services/user-service.js';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-service-call-list',
  imports: [
    RouterLink,
    FormsModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSelectModule,
    MatMenuModule,
    MatButtonModule,
  ],
  templateUrl: './service-call-list.html',
  styleUrl: './service-call-list.css',
})
export class ServiceCallList {
  protected serviceCallService = inject(ServiceCallService);
  protected userService = inject(UserService);
  protected protocols = ['HTTP'] as const;
  protected selectedProtocol = model<Protocol>('HTTP');
  protected columns = ['favorite', 'id', 'name', 'submitted', 'execution', 'status', 'details'];

  async toggleFavorite(element: ServiceCall) {
    if (element.isFavorite) {
      await this.serviceCallService.removeFavorite(element.id);
    } else {
      await this.serviceCallService.addFavorite(element.id);
    }
  }
}
