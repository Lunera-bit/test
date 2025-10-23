import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  cartCount = 0;
  activeRoute = '/';
  toolbarColor = 'primary';
  animatedRoute: string | null = null;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd), startWith(null))
      .subscribe((ev) => {
        const url = (ev as NavigationEnd | null)?.urlAfterRedirects ?? this.router.url ?? '/';
        this.activeRoute = url.split('?')[0];
        this.toolbarColor = this.getColorForRoute(this.activeRoute);
        this.animatedRoute = this.activeRoute;
        setTimeout(() => (this.animatedRoute = null), 420);
      });
  }

ngOnInit() {
    // establecer color inicial según la ruta actual
    const initial = (this.router.url || '/').split('?')[0];
    this.updateRouteState(initial);

    // escuchar cambios de navegación
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((ev) => {
        const url = (ev as NavigationEnd).urlAfterRedirects.split('?')[0];
        this.updateRouteState(url);
      });
  }

  private updateRouteState(url: string) {
    this.activeRoute = url || '/';
    this.toolbarColor = this.getColorForRoute(this.activeRoute);
    this.animatedRoute = this.activeRoute;
    setTimeout(() => (this.animatedRoute = null), 420);
  }

  private getColorForRoute(route: string) {
    switch (route) {
      case '/':
      case '/inicio': return 'danger';      // rojo
      case '/promociones': return 'primary';// azul marino
      case '/pedidos': return 'warning';        // negro
      case '/perfil': return 'dark';     // amarillo
      default: return 'primary';
    }
  }

  isActive(route: string) {
    return this.activeRoute === route;
  }
}