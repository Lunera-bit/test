import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';

import { IonContent, IonSearchbar, IonIcon } from '@ionic/angular/standalone';
import { FooterComponent } from '../../components/footer/footer/footer.component';
import { HeaderComponent } from '../../components/header/header/header.component';
import { NotFoundComponent } from '../../components/not-found/not-found.component';
import { ProductService, Product } from '../../services/product.service';

import Swiper from 'swiper/bundle';

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

  // ya no hay promociones en Inicio según tu petición
  promocionesFlash: { imagen: string; nombre?: string }[] = [];

  private productsSub?: Subscription;

  private productInstances: Swiper[] = [];

  currentSlide = 0;
  cartMap: Record<string, number> = {};
  private subs: Subscription[] = [];

  // control badges transitorios
  showQtyBadge: Record<string, boolean> = {};
  private badgeTimers: Map<string, any> = new Map();

  // favoritos en memoria (usa id como string)
  favorites: Set<string> = new Set();

  // placeholders / loading
  loading = true; // true hasta que productos se reciban
  skeletons = [0, 1, 2, 3]; 

  constructor(private productSvc: ProductService, private hostRef: ElementRef, private cart: CartService) {}

  toggleFavorite(p: Product) {
    const id = String(p.id ?? p.nombre ?? '');
    if (!id) return;
    if (this.favorites.has(id)) this.favorites.delete(id);
    else this.favorites.add(id);
    try { localStorage.setItem('favorites', JSON.stringify(Array.from(this.favorites))); } catch {}
  }

  isFavorite(p: Product): boolean {
    const id = String(p.id ?? p.nombre ?? '');
    if (!id) return false;
    return this.favorites.has(id);
  }

  ngOnInit(): void {
    this.loading = true;
    this.productsSub = this.productSvc.getProducts().subscribe((list: Product[]) => {
      this.productos = list || [];
      this.productosFiltrados = [...this.productos];
      this.groupProducts(this.productosFiltrados);

      // guardar copias originales PARA LA BÚSQUEDA
      this.originalPizzas = [...this.pizzas];
      this.originalBebidas = [...this.bebidas];
      this.originalOtros = [...this.otros];

      // inicializar swipers tras render de las cards reales
      // pequeño retardo para permitir Angular renderizar DOM
      setTimeout(() => {
        this.initProductSwipers();
        this.loading = false;
      }, 80);
    }, err => {
      console.error('Error cargando productos', err);
      this.loading = false;
    });

    this.subs.push(
      this.cart.cart$.subscribe(items => {
        const map: Record<string, number> = {};
        (items || []).forEach(i => { map[String(i.id)] = (map[String(i.id)] ?? 0) + (i.qty ?? 1); });
        this.cartMap = map;
      })
    );

    this.subs.push(
      this.cart.added$.subscribe(({ id }) => {
        if (id) this.showTransientBadge(String(id));
      })
    );

    try {
      const raw = localStorage.getItem('favorites');
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        arr.forEach(id => this.favorites.add(String(id)));
      }
    } catch {}
  }

  ngAfterViewInit() {
    // si ya cargaron productos (cache) inicializar swipers también
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
    this.pizzas = items.filter(p => normalize(p.categoria) === 'pizzas' || normalize(p.categoria) === 'pizza');
    this.bebidas = items.filter(p => normalize(p.categoria) === 'bebidas' || normalize(p.categoria) === 'bebida');
    this.otros = items.filter(p => {
      const c = normalize(p.categoria);
      return c !== 'pizzas' && c !== 'pizza' && c !== 'bebidas' && c !== 'bebida';
    });
  }

  buscarProducto() {
    this.searched = !!this.terminoBusqueda && this.terminoBusqueda.trim().length > 0;
    if (!this.searched) {
      this.pizzas = [...this.originalPizzas];
      this.bebidas = [...this.originalBebidas];
      this.otros = [...this.originalOtros];
      this.searchHasResults = true;
      return;
    }

    const q = this.terminoBusqueda.toLowerCase().trim();

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

  onImgError(ev: Event) {
    const img = ev?.target as HTMLImageElement | null;
    if (img) img.src = 'assets/img/placeholder.png';
  }

  private initProductSwipers() {
    // destroy prev
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

  getQty(id?: string): number {
    if (!id) return 0;
    return this.cartMap[String(id)] ?? 0;
  }
}