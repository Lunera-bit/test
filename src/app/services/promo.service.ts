import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Promo {
  id?: string;
  nombre: string;
  descripcion?: string;
  precio?: number;
  imagen?: string;
}

@Injectable({ providedIn: 'root' })
export class PromoService {
  constructor(private firestore: Firestore) {}

  // obtiene todos los Promoos (colección 'Promos')
  getPromos(): Observable<Promo[]> {
    const collRef = collection(this.firestore, 'promo');
    return collectionData(collRef, { idField: 'id' }) as Observable<Promo[]>;
  }

  // Promoo por id (doc)
  getPromoById(id: string): Observable<Promo | undefined> {
    const docRef = doc(this.firestore, `promo/${id}`);
    return docData(docRef, { idField: 'id' }) as Observable<Promo | undefined>;
  }
}