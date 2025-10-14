import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user-service.js';

@Component({
  selector: 'app-signin',
  imports: [ReactiveFormsModule],
  templateUrl: './signin.html',
  styleUrl: './signin.css',
})
export class Signin {
  private userService = inject(UserService);
  protected userId = new FormControl('', {
    nonNullable: true,
    validators: (control) => (control.value ? null : { required: true }),
  });

  signin() {
    this.userService.signIn(this.userId.value!);
  }
}
