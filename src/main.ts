import { addIcons } from 'ionicons';
import {
  homeOutline,
  pricetagOutline,
  flameOutline,
  cartOutline,
  notificationsOutline,
  personOutline,
  alertCircleOutline,
  heartOutline,
  addOutline,
  removeOutline,
  heart,
  exit,
  sadOutline,
  addCircleOutline,
  cart

} from 'ionicons/icons';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// NEW: Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { provideFirebaseApp } from '@angular/fire/app';
import { provideFirestore } from '@angular/fire/firestore';
import { environment } from './environments/environment';


bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),

    // Firebase providers (inicializa con tu environment.firebase)
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
  ],
  
});

addIcons({
  'home-outline': homeOutline,
  'pricetag-outline': pricetagOutline,
  'cart-outline': cartOutline,
  'person-outline': personOutline,
  'cart': cart,
  'flame-outline': flameOutline ,
  'notifications-outline': notificationsOutline,
  'alert-circle': alertCircleOutline,
  'alert-circle-outline': alertCircleOutline,
  'heart-outline': heartOutline,
  'heart': heart,
  'exit': exit,
  'add-circle-outline': addCircleOutline,
  'add-outline': addOutline,       
  'remove-outline': removeOutline, 
  'sad-outline': sadOutline   
});