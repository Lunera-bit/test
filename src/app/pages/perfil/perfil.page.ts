import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Observable } from 'rxjs';
import { updateProfile } from 'firebase/auth';

import { FooterComponent } from '../../components/footer/footer/footer.component';
import { HeaderComponent } from '../../components/header/header/header.component';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, HeaderComponent, FooterComponent],
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss']
})
export class PerfilPage {
  user$: Observable<any>;
  nameForm!: FormGroup;
  saving = false;

  defaultAvatar = 'assets/img/avatar-default.svg';
  photo: string = this.defaultAvatar;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private userService: UserService,
    private toastCtrl: ToastController,
    public nav: NavController
  ) {
    this.nameForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(2)]]
    });

    this.user$ = this.auth.authState$;
    this.user$.subscribe(u => {
      if (u) {
        this.nameForm.patchValue({ displayName: u.displayName ?? '' }, { emitEvent: false });
        // usar directamente photoURL o fallback al defaultAvatar
        this.photo = u.photoURL ?? this.defaultAvatar;
      } else {
        this.photo = this.defaultAvatar;
      }
    });
  }

  onImgError() {
    this.photo = this.defaultAvatar;
  }

  async saveName() {
    if (this.nameForm.invalid) {
      this.showToast('Ingresa un nombre válido (mín. 2 caracteres)');
      return;
    }
    const name = this.nameForm.value.displayName!.trim();
    const fbUser = this.auth.currentUser();
    if (!fbUser) {
      this.showToast('No hay sesión activa');
      return;
    }
    this.saving = true;
    try {
      await updateProfile(fbUser, { displayName: name });
      await this.userService.upsertUser(fbUser);
      this.showToast('Nombre actualizado');
    } catch (err: any) {
      this.showToast(err?.message || 'Error actualizando nombre');
    } finally {
      this.saving = false;
    }
  }

  async logout() {
    await this.auth.logout();
    this.nav.navigateRoot('/login');
  }

  private async showToast(message: string) {
    const t = await this.toastCtrl.create({ message, duration: 2000 });
    await t.present();
  }
}
