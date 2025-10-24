import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { Promocion } from '../models/promocion.model';

@Injectable({ providedIn: 'root' })
export class PromoService {
  constructor(private firestore: Firestore) {}

  // obtiene todas las promociones
  getPromos(): Observable<Promocion[]> {
    const collRef = collection(this.firestore, 'promo');
    return collectionData(collRef, { idField: 'id' }).pipe(
      map((data: any[]) => data.map((d) => new Promocion(d)))
    );
  }

  // obtiene promoción por id
  getPromoById(id: string): Observable<Promocion | undefined> {
    const docRef = doc(this.firestore, `promo/${id}`);
    return docData(docRef, { idField: 'id' }).pipe(
      map((d: any) => (d ? new Promocion(d) : undefined))
    );
  }
}
