import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, startWith } from 'rxjs/operators';
import { LoaderService } from '../../../services/loader.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  cartCount = 0;
  activeRoute = '/';
  toolbarColor = 'primary';
  animatedRoute: string | null = null;

  constructor(private router: Router, private loader: LoaderService) {
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

  private getColorForRoute(route: string) {
    switch (route) {
      case '/':
      case '/inicio': return 'danger';
      case '/promociones': return 'primary';
      case '/pedidos': return 'warning';
      case '/perfil': return 'dark';
      default: return 'primary';
    }
  }

  isActive(route: string) {
    return this.activeRoute === route;
  }

  // show loader then navigate; AppComponent will hide loader on navigation end
  navigate(route: string) {
    this.loader.show('Cargando...');
    // small delay to ensure loader renders before navigation
    setTimeout(() => this.router.navigateByUrl(route), 30);
  }
}