import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ProductModel } from '../models/Producto';

export interface Product {
  id?: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria: string;
  imagenURL?: string;
  estado?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private firestore: Firestore) {}

  // Obtener todos los productos
  getProducts(): Observable<Product[]> {
    const coll = collection(this.firestore, 'products');
    return collectionData(coll, { idField: 'id' }) as Observable<Product[]>;
  }

  // Obtener producto por ID
  getProductById(id: string): Observable<Product | undefined> {
    const docRef = doc(this.firestore, `products/${id}`);
    return docData(docRef, { idField: 'id' }) as Observable<Product | undefined>;
  }

  // Agregar un nuevo producto
  addProduct(product: Product) {
    const coll = collection(this.firestore, 'products');
    return addDoc(coll, product);
  }

  // Actualizar producto
  updateProduct(id: string, product: Partial<Product>) {
    const docRef = doc(this.firestore, `products/${id}`);
    return updateDoc(docRef, product);
  }

  // Eliminar producto
  deleteProduct(id: string) {
    const docRef = doc(this.firestore, `products/${id}`);
    return deleteDoc(docRef);
  }
}
