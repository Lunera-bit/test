import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FooterComponent } from '../../components/footer/footer/footer.component';
import { HeaderComponent } from '../../components/header/header/header.component';

import { Subscription } from 'rxjs';
import { PromoService, Promo } from '../../services/promo.service';
@Component({
  selector: 'app-promociones',
  standalone: true,
  imports: [IonicModule, CommonModule, FooterComponent, HeaderComponent],
  templateUrl:'./promociones.page.html',
  styleUrls: ['./promociones.page.scss'],
})

export class PromocionesPage {
  promociones: Promo[] = [];

  private promosSub?: Subscription;

  constructor(private promoSvc: PromoService) {}

  ngOnInit() {
    this.promosSub = this.promoSvc.getPromos().subscribe((list: Promo[]) => {
      this.promociones = list || [];
    });
  }

  ngOnDestroy() {
    this.promosSub?.unsubscribe();
  } 
}
