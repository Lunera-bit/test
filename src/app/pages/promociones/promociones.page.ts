// ...existing code...
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FooterComponent } from '../../components/footer/footer/footer.component';
import { HeaderComponent } from '../../components/header/header/header.component';
import { AddToCartComponent } from '../../components/add-to-cart/add-to-cart.component';
import { CartService } from '../../services/cart.service';
// <-- IMPORTA TU SERVICIO REAL DE PROMOCIONES AQUI:
import { PromoService } from '../../services/promo.service'; // ajusta la ruta si hace falta
// ...existing code...

@Component({
  selector: 'app-promociones',
  standalone: true,
  imports: [IonicModule, CommonModule, FooterComponent, HeaderComponent, AddToCartComponent],
  // opcional: si PromoService no tiene providedIn:'root' descomenta providers:
  // providers: [PromoService],
  templateUrl:'./promociones.page.html',
  styleUrls: ['./promociones.page.scss'],
})
export class PromocionesPage implements OnInit, OnDestroy {
  promociones: any[] = [];
  cartMap: Record<string, number> = {};
  private subs: any[] = [];

  constructor(private promoSvc: PromoService, private cart: CartService) {}

  ngOnInit() {
    // suscribir promos (mantener tu lógica existente)
    if (this.promoSvc?.getPromos) {
      this.subs.push(this.promoSvc.getPromos().subscribe((list: any[]) => this.promociones = list || []));
    }
    // suscribir carrito para mostrar cantidades
    this.subs.push(this.cart.cart$.subscribe(items => {
      const map: Record<string, number> = {};
      items.forEach(i => { map[i.id] = (map[i.id] ?? 0) + (i.qty || 1); });
      this.cartMap = map;
    }));
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  onAddedPromo(promo: any) {
    // hook opcional: animación, analytics, abrir drawer carrito, etc.
    console.log('Añadido al carrito:', promo?.id);
  }
}
// ...existing code...