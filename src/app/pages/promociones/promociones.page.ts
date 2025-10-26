import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FooterComponent } from '../../components/footer/footer/footer.component';
import { HeaderComponent } from '../../components/header/header/header.component';
import { AddToCartComponent } from '../../components/add-to-cart/add-to-cart.component';
import { CartService } from '../../services/cart.service';
import { PromoService } from '../../services/promo.service';
import { Promocion } from 'src/app/models/promocion.model';

@Component({
  selector: 'app-promociones',
  standalone: true,
  imports: [IonicModule, CommonModule, FooterComponent, HeaderComponent, AddToCartComponent],
  templateUrl: './promociones.page.html',
  styleUrls: ['./promociones.page.scss'],
})
export class PromocionesPage implements OnInit, OnDestroy {
  promociones: Promocion[] = [];
  cartMap: Record<string, number> = {};
  private subs: any[] = [];

  constructor(private promoSvc: PromoService, private cart: CartService) {}

  ngOnInit() {
    this.subs.push(
      this.promoSvc.getPromos().subscribe((list: Promocion[]) => (this.promociones = list || []))
    );

    this.subs.push(
      this.cart.cart$.subscribe((items) => {
        const map: Record<string, number> = {};
        items.forEach((i) => {
          map[i.id] = (map[i.id] ?? 0) + (i.qty || 1);
        });
        this.cartMap = map;
      })
    );
  }

  ngOnDestroy() {
    this.subs.forEach((s) => s.unsubscribe());
  }

  onAddedPromo(promo: Promocion) {
    console.log('Añadido al carrito:', promo?.id);
  }
}
