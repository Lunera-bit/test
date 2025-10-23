// ...existing code...
import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { IonContent, IonSearchbar, IonBadge, IonButton, IonIcon } from '@ionic/angular/standalone';
import { FooterComponent } from '../../components/footer/footer/footer.component';
import { HeaderComponent } from '../../components/header/header/header.component';
import { ProductService, Product } from '../../services/product.service';

// usa el bundle (incluye módulos)
import Swiper from 'swiper/bundle';
// estilos de Swiper deben importarse en src/styles.scss o src/global.scss

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent, IonSearchbar, IonBadge, IonButton, IonIcon,
    FooterComponent, HeaderComponent
  ],
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss']
})
export class InicioPage implements OnInit, AfterViewInit, OnDestroy {
  terminoBusqueda = '';

  productos: Product[] = [];
  productosFiltrados: Product[] = [];

  pizzas: Product[] = [];
  bebidas: Product[] = [];
  otros: Product[] = [];

  promocionesFlash: { imagen: string; nombre?: string }[] = []; // si vacío no se muestra

  private productsSub?: Subscription;

  @ViewChild('promoSwiper', { static: false }) promoSwiper?: ElementRef<HTMLElement>;

  private promoInstance?: Swiper;
  private productInstances: Swiper[] = [];

  currentSlide = 0;

  constructor(private productSvc: ProductService, private hostRef: ElementRef) {}

  ngOnInit() {
    this.productsSub = this.productSvc.getProducts().subscribe((list: Product[]) => {
      this.productos = list || [];
      this.productosFiltrados = [...this.productos];
      this.groupProducts(this.productosFiltrados);
      setTimeout(() => this.initProductSwipers(), 60);
    }, err => {
      console.error('Error cargando productos', err);
    });
  }

  ngAfterViewInit() {
    setTimeout(() => this.initPromoSwiper(), 60);
    setTimeout(() => this.initProductSwipers(), 120);
  }

  ngOnDestroy() {
    this.productsSub?.unsubscribe();
    this.destroyAllSwipers();
  }

  private groupProducts(items: Product[]) {
    const normalize = (v: any) => String(v || '').toLowerCase().trim();
    this.pizzas = items.filter(p => normalize(p.categoria) === 'pizzas');
    this.bebidas = items.filter(p => normalize(p.categoria) === 'bebidas');
    this.otros = items.filter(p => {
      const c = normalize(p.categoria);
      return c !== 'pizzas' && c !== 'bebidas';
    });
  }

  buscarProducto() {
    const q = (this.terminoBusqueda || '').trim().toLowerCase();
    if (!q) {
      this.productosFiltrados = [...this.productos];
    } else {
      this.productosFiltrados = this.productos.filter(p =>
        (p.nombre || '').toLowerCase().includes(q) ||
        (p.descripcion || '').toLowerCase().includes(q)
      );
    }
    this.groupProducts(this.productosFiltrados);
    setTimeout(() => this.initProductSwipers(), 80);
  }

  toggleFavorite(p: Product) { console.log('toggleFavorite', p.id ?? p.nombre); }
  addToCart(p: Product) { console.log('addToCart', p.id ?? p.nombre); }

  onImgError(ev: Event) {
    const img = ev?.target as HTMLImageElement | null;
    if (img) img.src = 'assets/img/placeholder.png';
  }

  // control autoplay desde template
  startAutoplay() { try { this.promoInstance?.autoplay?.start(); } catch { } }
  stopAutoplay() { try { this.promoInstance?.autoplay?.stop(); } catch { } }
  goTo(i: number) {
    if (!this.promoInstance) return;
    try {
      this.promoInstance.slideToLoop(i);
      this.currentSlide = i;
    } catch { }
  }

  private initPromoSwiper() {
    if (!this.promoSwiper) return;
    if (this.promoInstance) this.promoInstance.destroy(true, true);
    this.promoInstance = new Swiper(this.promoSwiper.nativeElement as HTMLElement, {
      loop: true,
      autoplay: { delay: 3000, disableOnInteraction: false },
      pagination: { el: this.promoSwiper.nativeElement.querySelector('.swiper-pagination') as HTMLElement, clickable: true },
      on: {
        slideChange: () => { this.currentSlide = this.promoInstance?.realIndex ?? 0; }
      }
    });
  }

  private initProductSwipers() {
    this.productInstances.forEach(i => i.destroy(true, true));
    this.productInstances = [];
    const hostEl = this.hostRef.nativeElement as HTMLElement;
    const nodes = hostEl.querySelectorAll('.product-swiper');
    nodes.forEach((el) => {
      const instance = new Swiper(el as HTMLElement, {
        slidesPerView: 'auto',
        centeredSlides: true,
        spaceBetween: 12,
        loop: false
      });
      this.productInstances.push(instance);
    });
  }

  private destroyAllSwipers() {
    this.promoInstance?.destroy(true, true);
    this.productInstances.forEach(i => i.destroy(true, true));
    this.productInstances = [];
  }
}
