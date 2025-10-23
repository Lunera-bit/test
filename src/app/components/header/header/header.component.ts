import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Input() title = 'MultiPizza';
  @Input() carritoCount = 0;
  @Input() notificacionesCount = 0;
  constructor(private router: Router) {}

  // método opcional para volver atrás si lo necesitas
  back() {
    this.router.navigate(['../']);
  }
}