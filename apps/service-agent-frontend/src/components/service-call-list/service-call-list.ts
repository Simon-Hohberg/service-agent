import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Protocol } from 'common';

@Component({
  selector: 'app-service-call-list',
  imports: [RouterLink, FormsModule],
  templateUrl: './service-call-list.html',
  styleUrl: './service-call-list.css',
})
export class ServiceCallList {
  protected protocols = ['HTTP'] as const;
  protected selectedProtocol = model<Protocol>('HTTP');
}
