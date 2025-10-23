import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';

import { IonContent, IonSearchbar, IonIcon } from '@ionic/angular/standalone';
import { FooterComponent } from '../../components/footer/footer/footer.component';
import { HeaderComponent } from '../../components/header/header/header.component';
import { NotFoundComponent } from '../../components/not-found/not-found.component';
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
    IonContent, IonSearchbar, IonIcon,
    FooterComponent, HeaderComponent, NotFoundComponent
  ],
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss']
})
export class InicioPage implements OnInit, AfterViewInit, OnDestroy {
  terminoBusqueda = '';
  searched = false;
  searchHasResults = true;

  productos: Product[] = [];
  productosFiltrados: Product[] = [];

  pizzas: Product[] = [];
  bebidas: Product[] = [];
  otros: Product[] = [];

  // COPIAS ORIGINALES para restaurar/filtrar
  private originalPizzas: Product[] = [];
  private originalBebidas: Product[] = [];
  private originalOtros: Product[] = [];

  promocionesFlash: { imagen: string; nombre?: string }[] = []; // si vacío no se muestra

  private productsSub?: Subscription;

  @ViewChild('promoSwiper', { static: false }) promoSwiper?: ElementRef<HTMLElement>;

  private promoInstance?: Swiper;
  private productInstances: Swiper[] = [];

  currentSlide = 0;
  cartMap: Record<string, number> = {};
  private subs: Subscription[] = [];

  // nuevos: control badges transitorios
  showQtyBadge: Record<string, boolean> = {};
  private badgeTimers: Map<string, any> = new Map();

  // favoritos en memoria (usa id como string)
  favorites: Set<string> = new Set();

  constructor(private productSvc: ProductService, private hostRef: ElementRef, private cart: CartService) {}

  toggleFavorite(p: Product) {
    const id = String(p.id ?? p.nombre ?? '');
    if (!id) return;
    if (this.favorites.has(id)) {
      this.favorites.delete(id);
    } else {
      this.favorites.add(id);
    }
    try { localStorage.setItem('favorites', JSON.stringify(Array.from(this.favorites))); } catch {}
  }

  isFavorite(p: Product): boolean {
    const id = String(p.id ?? p.nombre ?? '');
    if (!id) return false;
    return this.favorites.has(id);
  }

  ngOnInit(): void {
    this.productsSub = this.productSvc.getProducts().subscribe((list: Product[]) => {
      this.productos = list || [];
      this.productosFiltrados = [...this.productos];
      this.groupProducts(this.productosFiltrados);

      // guardar copias originales PARA LA BÚSQUEDA
      this.originalPizzas = [...this.pizzas];
      this.originalBebidas = [...this.bebidas];
      this.originalOtros = [...this.otros];

      setTimeout(() => this.initProductSwipers(), 60);
    }, err => {
      console.error('Error cargando productos', err);
    });

    this.subs.push(
      this.cart.cart$.subscribe(items => {
        const map: Record<string, number> = {};
        (items || []).forEach(i => { map[String(i.id)] = (map[String(i.id)] ?? 0) + (i.qty ?? 1); });
        this.cartMap = map;
      })
    );

    // nueva suscripción: cuando algo se añade, mostrar badge transitorio
    this.subs.push(
      this.cart.added$.subscribe(({ id }) => {
        if (id) this.showTransientBadge(String(id));
      })
    );

    // restaurar favoritos si existen
    try {
      const raw = localStorage.getItem('favorites');
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        arr.forEach(id => this.favorites.add(String(id)));
      }
    } catch {}
  }

  ngAfterViewInit() {
    setTimeout(() => this.initPromoSwiper(), 60);
    setTimeout(() => this.initProductSwipers(), 120);
  }

  ngOnDestroy() {
    this.productsSub?.unsubscribe();
    this.destroyAllSwipers();
    this.subs.forEach(s => s.unsubscribe());
    this.badgeTimers.forEach(t => clearTimeout(t));
    this.badgeTimers.clear();
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
    this.searched = !!this.terminoBusqueda && this.terminoBusqueda.trim().length > 0;
    if (!this.searched) {
      // si no hay término, restaurar originales
      this.pizzas = [...this.originalPizzas];
      this.bebidas = [...this.originalBebidas];
      this.otros = [...this.originalOtros];
      this.searchHasResults = true;
      return;
    }

    const q = this.terminoBusqueda.toLowerCase().trim();

    // filtrar por nombre / descripción (ajusta campos según tu modelo)
    this.pizzas = this.originalPizzas.filter((p: Product) =>
      ((p.nombre || '').toLowerCase().includes(q) || (p.descripcion || '').toLowerCase().includes(q))
    );
    this.bebidas = this.originalBebidas.filter((p: Product) =>
      ((p.nombre || '').toLowerCase().includes(q) || (p.descripcion || '').toLowerCase().includes(q))
    );
    this.otros = this.originalOtros.filter((p: Product) =>
      ((p.nombre || '').toLowerCase().includes(q) || (p.descripcion || '').toLowerCase().includes(q))
    );

    const total = this.pizzas.length + this.bebidas.length + this.otros.length;
    this.searchHasResults = total > 0;
  }

  addToCart(p: Product) { console.log('addToCart', p.id ?? p.nombre); }

  onImgError(ev: Event) {
    const img = ev?.target as HTMLImageElement | null;
    if (img) img.src = 'assets/img/placeholder.png';
  }

  onAddedProduct(product: any) {
    console.log('Producto añadido desde Inicio:', product?.id);
    // aquí puedes abrir el carrito, mostrar toast, animación, etc.
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
        centeredSlides: false,
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

  private showTransientBadge(id: string, duration = 1400) {
    const prevTimer = this.badgeTimers.get(id);
    if (prevTimer) { clearTimeout(prevTimer); this.badgeTimers.delete(id); }
    this.showQtyBadge[id] = true;
    const t = setTimeout(() => { this.showQtyBadge[id] = false; this.badgeTimers.delete(id); }, duration);
    this.badgeTimers.set(id, t);
  }

  // helper seguro para obtener cantidad sin indexar con posible undefined
  getQty(id?: string): number {
    if (!id) return 0;
    return this.cartMap[String(id)] ?? 0;
  }
}