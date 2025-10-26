import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() title = 'MultiPizza';
  @Input() notificacionesCount = 0;

  carritoCount = 0;
  cartIcon = 'cart-outline';
  cartPulse = false;

  private subs: Subscription[] = [];

  constructor(private router: Router, private cart: CartService) {}

  ngOnInit() {
    // actualizar contador cuando cambie el carrito y ajustar icono
    this.subs.push(
      this.cart.cart$.subscribe(items => {
        const total = (items || []).reduce((s, i) => s + (Number(i.qty) || 0), 0);
        this.carritoCount = total;
        this.cartIcon = total > 0 ? 'cart' : 'cart-outline';
      })
    );

    // animación breve cuando se añade algo
    this.subs.push(
      this.cart.added$.subscribe(() => {
        this.cartPulse = true;
        setTimeout(() => (this.cartPulse = false), 700);
      })
    );
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  // método opcional para volver atrás si lo necesitas
  back() {
    this.router.navigate(['../']);
  }

  openCart() {
    this.router.navigate(['/carrito']);
  }
}