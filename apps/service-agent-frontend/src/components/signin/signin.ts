import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user-service.js';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-signin',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './signin.html',
  styleUrl: './signin.css',
})
export class Signin {
  protected userService = inject(UserService);
  protected form: FormGroup = new FormGroup({
    userId: new FormControl('', {
      nonNullable: true,
      validators: (control) => (control.value ? null : { required: true }),
    }),
  });

  signin() {
    this.userService.signIn(this.form.get('userId')!.value!);
  }
}
