import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Product } from '../../services/product.service';

@Component({
  selector: 'app-favorite-button',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './favorite-button.component.html',
  styleUrls: ['./favorite-button.component.scss']
})
export class FavoriteButtonComponent implements OnInit {
  @Input() product?: Product;
  @Input() storageKey = 'favorites';
  @Output() toggled = new EventEmitter<{ product?: Product; isFavorite: boolean }>();

  isFavorite = false;

  ngOnInit(): void {
    this.syncFromStorage();
  }

  private keyOf(p?: Product): string {
    if (!p) return '';
    return String((p as any).id ?? (p as any).nombre ?? '');
  }

  private readStorage(): string[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) as string[] : [];
    } catch { return []; }
  }

  private writeStorage(list: string[]) {
    try { localStorage.setItem(this.storageKey, JSON.stringify(list)); } catch {}
  }

  private syncFromStorage() {
    const k = this.keyOf(this.product);
    if (!k) { this.isFavorite = false; return; }
    const arr = this.readStorage();
    this.isFavorite = arr.includes(k);
  }

  toggle(ev?: Event) {
    if (ev) ev.stopPropagation();
    const k = this.keyOf(this.product);
    if (!k) return;
    const arr = this.readStorage();
    if (this.isFavorite) {
      const idx = arr.indexOf(k);
      if (idx >= 0) arr.splice(idx, 1);
      this.isFavorite = false;
    } else {
      arr.push(k);
      this.isFavorite = true;
    }
    this.writeStorage(arr);
    this.toggled.emit({ product: this.product, isFavorite: this.isFavorite });
  }
}