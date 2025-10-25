import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'inicio',
    loadComponent: () =>
      import('./pages/inicio/inicio.page').then((m) => m.InicioPage),
  },
  {
    path: 'promociones',
    loadComponent: () =>
      import('./pages/promociones/promociones.page').then((m) => m.PromocionesPage),
  },
  {
    path: 'pedidos',
    loadComponent: () => import('./pages/pedidos/pedidos.page').then( m => m.PedidosPage)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.page').then( m => m.PerfilPage)
  },
  {
    path: 'carrito',
    loadComponent: () => import('./pages/carrito/carrito.page').then( m => m.CarritoPage)
  }
,
{
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  }
];

