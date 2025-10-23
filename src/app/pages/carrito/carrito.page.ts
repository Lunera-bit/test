import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { CartService, CartItem } from '../../services/cart.service';
import { HeaderComponent } from '../../components/header/header/header.component';
import { FooterComponent } from '../../components/footer/footer/footer.component';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [IonicModule, CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
})
export class CarritoPage implements OnInit, OnDestroy {
  items: CartItem[] = [];
  total = 0;
  private sub?: Subscription;

  constructor(private cart: CartService) {}

  ngOnInit() {
    this.sub = this.cart.cart$.subscribe(items => {
      this.items = items || [];
      this.recalc();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  private recalc() {
    this.total = this.items.reduce((s, it) => s + ((it.price || 0) * (it.qty || 0)), 0);
  }

  increase(item: CartItem) {
    this.cart.setItemQty(item.id, item.type, (item.qty || 0) + 1);
  }

  decrease(item: CartItem) {
    const n = (item.qty || 0) - 1;
    this.cart.setItemQty(item.id, item.type, n);
  }

  buy() {
    console.log('comprado');
    // opcional: this.cart.clear();
  }
}