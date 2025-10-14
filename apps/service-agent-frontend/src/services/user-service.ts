import { httpResource } from '@angular/common/http';
import { computed, inject, Injectable, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { UserDTO, UserWithTenantsDTO } from 'common';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  readonly router = inject(Router);
  readonly userId = signal<string>('');

  signInResource = httpResource<UserWithTenantsDTO>(() => {
    const userId = this.userId();
    if (!!userId) {
      return {
        url: `http://localhost:3000/auth/signin`,
        method: 'POST',
        body: {
          id: userId,
        } as UserDTO,
      };
    } else {
      return undefined;
    }
  });

  isSignedIn = computed(() => {
    if (this.signInResource.hasValue()) {
      return true;
    } else {
      return false;
    }
  });

  constructor() {
    effect(() => {
      if (this.isSignedIn()) {
        this.router.navigate(['/']);
      }
    });
  }

  signIn(userId: string) {
    this.userId.set(userId);
  }
}
