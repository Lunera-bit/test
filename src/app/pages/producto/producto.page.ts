import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { AddToCartComponent } from '../../components/add-to-cart/add-to-cart.component';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonButton, IonIcon, AddToCartComponent],
  templateUrl: './producto.page.html',
  styleUrls: ['./producto.page.scss']
})
export class ProductoPage implements OnInit {
  product: any = null;
  rating = 0;

  constructor(private route: ActivatedRoute, private productSvc: ProductService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    // buscar producto (si ProductService tiene getProductById úsalo; aquí usamos getProducts y find por compatibilidad)
    this.productSvc.getProducts().subscribe(list => {
      this.product = (list || []).find((p: any) => String(p.id) === String(id)) ?? null;
      this.rating = this.product?.rating ?? 0;
    }, err => console.error(err));
  }

  setRating(v: number) {
    if (v < 1) v = 1;
    if (v > 5) v = 5;
    this.rating = v;
    // opcional: persistir la calificación en backend si tienes método para ello
  }
}