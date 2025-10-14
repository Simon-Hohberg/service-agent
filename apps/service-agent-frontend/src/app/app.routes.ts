import { RedirectCommand, Router, Routes } from '@angular/router';
import { CreateHttpServiceCall } from '../components/create-http-service-call/create-http-service-call.js';
import { inject } from '@angular/core';
import { UserService } from '../services/user-service.js';
import { Signin } from '../components/signin/signin.js';
import { ServiceCallList } from '../components/service-call-list/service-call-list.js';
import { Home } from '../components/home/home.js';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    canActivate: [
      () => {
        const router = inject(Router);
        const userService = inject(UserService);
        if (userService.isSignedIn()) {
          return true;
        }
        const loginPath = router.parseUrl('signin');
        return new RedirectCommand(loginPath, { skipLocationChange: true });
      },
    ],
    children: [
      { path: 'serviceCall/http/new', component: CreateHttpServiceCall },
      { path: 'serviceCall/http/:id', component: CreateHttpServiceCall },
      { path: 'serviceCall/list', component: ServiceCallList },
      { path: '', redirectTo: 'serviceCall/list', pathMatch: 'full' },
    ],
  },
  {
    path: 'signin',
    component: Signin,
  },
  { path: '**', redirectTo: '/signin' },
];
