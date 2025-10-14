import { httpResource } from '@angular/common/http';
import { computed, inject, Injectable, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { UserDTO, UserWithTenantsDTO } from 'common';
import { environment } from '../environments/environment.js';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  readonly router = inject(Router);
  private readonly _userId = signal<string>('');
  readonly signInResource = httpResource<UserWithTenantsDTO>(() => {
    const userId = this._userId();
    if (!!userId) {
      return {
        url: `${environment.apiUrl}/auth/signin`,
        method: 'POST',
        body: {
          id: userId,
        } as UserDTO,
      };
    } else {
      return undefined;
    }
  });
  readonly userTenants = computed(() => {
    if (!this.signInResource.hasValue()) {
      return [];
    }
    return this.signInResource.value().tenants;
  });
  private readonly _currentTenant = signal<string | null>(null);

  isSignedIn = computed(() => this.signInResource.hasValue());

  constructor() {
    effect(() => {
      if (this.isSignedIn()) {
        this.router.navigate(['/']);
      }
    });
    effect(() => {
      console.log(`current tenant: ${this._currentTenant()}`);
    });
  }

  get currentTenant() {
    return this._currentTenant.asReadonly();
  }

  get userId() {
    return this._userId.asReadonly();
  }

  signIn(userId: string) {
    this._userId.set(userId);
  }

  setCurrentTenant(tenantId: string) {
    this._currentTenant.set(tenantId);
  }
}
