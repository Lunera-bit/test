import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, MenuController, NavController, ToastController } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { updateProfile } from 'firebase/auth';

import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile-menu',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './profile-menu.component.html',
  styleUrls: ['./profile-menu.component.scss']
})
export class ProfileMenuComponent implements OnInit {
  nameForm: FormGroup;
  defaultAvatar = 'assets/img/avatar-default.svg';
  photo = this.defaultAvatar;
  displayName = 'Usuario';
  displayEmail = '';
  saving = false;

  // nuevo flag para la UI
  isLoggedIn = false;

  constructor(
    private menu: MenuController,
    private nav: NavController,
    private toastCtrl: ToastController,
    private fb: FormBuilder,
    private auth: AuthService,
    private userService: UserService
  ) {
    this.nameForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    // aplicar usuario actual si existe
    try {
      // llamar al método correctamente
      const cur = this.auth.currentUser();
      if (cur) this.applyUser(cur);
    } catch {}

    // suscribirse a cambios de auth
    this.auth.authState$.subscribe(u => {
      this.applyUser(u);
    });
  }

  private applyUser(u: any) {
    this.isLoggedIn = !!u; // actualizar flag

    if (!u) {
      this.photo = this.defaultAvatar;
      this.displayName = 'Usuario';
      this.displayEmail = '';
      return;
    }
    this.displayName = u.displayName ?? (u.email ?? 'Usuario');
    this.displayEmail = u.email ?? '';
    this.photo = u.photoURL ?? this.defaultAvatar;
    try { this.nameForm.patchValue({ displayName: u.displayName ?? '' }, { emitEvent: false }); } catch {}
  }

  onImgError() { this.photo = this.defaultAvatar; }

  async saveName() {
    if (this.nameForm.invalid) {
      (await this.toastCtrl.create({ message: 'Nombre inválido', duration: 1400 })).present();
      return;
    }
    // obtener usuario mediante el método del servicio
    const fbUser = this.auth.currentUser();
    if (!fbUser) {
      (await this.toastCtrl.create({ message: 'No hay sesión activa', duration: 1400 })).present();
      return;
    }
    this.saving = true;
    try {
      await updateProfile(fbUser, { displayName: this.nameForm.value.displayName.trim() });
      await this.userService.upsertUser(fbUser);
      (await this.toastCtrl.create({ message: 'Nombre actualizado', duration: 1400 })).present();
      await this.menu.close('profileMenu');
    } catch (err: any) {
      (await this.toastCtrl.create({ message: err?.message ?? 'Error', duration: 1600 })).present();
    } finally {
      this.saving = false;
    }
  }

  // navegar al login (usado cuando no hay sesión)
  async goToLogin() {
    await this.menu.close('profileMenu');
    await this.nav.navigateRoot('/login');
  }

  // logout real
  async logout() {
    try {
      await this.auth.logout();
    } catch {}
    await this.menu.close('profileMenu');
    await this.menu.enable(false, 'profileMenu');
    await this.nav.navigateRoot('/login');
  }
  
  async close() { await this.menu.close('profileMenu'); }
}