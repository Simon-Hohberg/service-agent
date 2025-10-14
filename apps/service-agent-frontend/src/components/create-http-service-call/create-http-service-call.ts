import { Component, inject, model } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { CreateHttpServiceCallDTO } from 'common';
import { ServiceCallService } from '../../services/service-call-service.js';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-http-service-call',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatTimepickerModule,
    MatIconModule,
    MatOptionModule,
    MatSelectModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './create-http-service-call.html',
  styleUrl: './create-http-service-call.css',
})
export class CreateHttpServiceCall {
  protected serviceCallService = inject(ServiceCallService);
  protected router = inject(Router);
  protected readonly headers = new FormArray<
    FormGroup<{
      key: FormControl<string | null>;
      value: FormControl<string | null>;
    }>
  >([]);

  protected form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(1)]),
    isFavorite: new FormControl(false),
    scheduledDate: new FormControl<Date | null>(null),
    scheduledTime: new FormControl<Date | null>(null),
    url: new FormControl('', [Validators.required, Validators.pattern('https?://.+')]),
    method: new FormControl<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'>(
      'GET',
      [Validators.pattern('GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS'), Validators.required]
    ),
    headers: this.headers,
    body: new FormControl(null),
  });

  constructor() {
    this.form.events.subscribe((e) => {
      console.log(e);
    });
  }

  protected scheduleExecution = model(false);

  protected async createHttpServiceCall() {
    if (this.form.valid) {
      const value = this.form.value;
      const scheduledAt =
        value.scheduledDate && value.scheduledTime
          ? new Date(
              value.scheduledDate.getFullYear(),
              value.scheduledDate.getMonth(),
              value.scheduledDate.getDate(),
              value.scheduledTime.getHours(),
              value.scheduledTime.getMinutes()
            ).toISOString()
          : undefined;

      const data: CreateHttpServiceCallDTO = {
        name: value.name!,
        isFavorite: value.isFavorite ?? false,
        request: {
          url: value.url!,
          method: value.method!,
          headers: (value.headers ?? []).reduce((acc, cur) => {
            if (cur.key && cur.value) {
              acc[cur.key] = cur.value;
            }
            return acc;
          }, {} as Record<string, string>),
          body: value.body ?? undefined,
        },
        scheduledAt,
      };
      await this.serviceCallService.createHttpServiceCall(data);
      this.router.navigate(['/serviceCall/list']);
    }
  }

  addHeader() {
    this.headers.push(
      new FormGroup({
        key: new FormControl('', Validators.minLength(1)),
        value: new FormControl('', Validators.minLength(1)),
      })
    );
  }

  deleteHeader(index: number) {
    this.headers.removeAt(index);
  }
}
