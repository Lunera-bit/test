import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export interface CartItem {
  id: string;
  type?: string; // 'product' | 'promo' | libre
  title?: string;
  price: number;
  qty: number;
  meta?: Record<string, any>;
}

const STORAGE_KEY = 'appmultipizza_cart_v1';

@Injectable({ providedIn: 'root' })
export class CartService {
  private subject = new BehaviorSubject<CartItem[]>(this.loadFromStorage());
  cart$ = this.subject.asObservable();

  // nuevo: stream que emite cuando se añade algo al carrito
  private addedSubject = new Subject<{ id: string; qty: number }>();
  added$ = this.addedSubject.asObservable();

  private loadFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) as CartItem[] : [];
    } catch {
      return [];
    }
  }

  private save(items: CartItem[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
    this.subject.next(items);
  }

  getItems(): CartItem[] {
    return this.subject.getValue().slice();
  }

  addItem(item: CartItem) {
    const items = this.getItems();
    const idx = items.findIndex(i => i.id === item.id && i.type === item.type);
    if (idx > -1) {
      items[idx].qty += item.qty;
      this.save(items);
      // emitir sólo el delta añadido
      this.addedSubject.next({ id: item.id, qty: item.qty });
    } else {
      items.push({ ...item });
      this.save(items);
      this.addedSubject.next({ id: item.id, qty: item.qty });
    }
  }

  setItemQty(id: string, type: string | undefined, qty: number) {
    const items = this.getItems();
    const idx = items.findIndex(i => i.id === id && i.type === type);
    if (idx > -1) {
      if (qty <= 0) items.splice(idx, 1);
      else items[idx].qty = qty;
      this.save(items);
    }
  }

  removeItem(id: string, type?: string) {
    const items = this.getItems().filter(i => !(i.id === id && i.type === type));
    this.save(items);
  }

  clear() {
    this.save([]);
  }
}