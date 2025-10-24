import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonToggle } from '@ionic/angular/standalone';
import { FooterComponent } from '../../components/footer/footer/footer.component';
import { HeaderComponent } from '../../components/header/header/header.component';
import { addIcons } from 'ionicons';
import { 
  personCircleOutline, 
  personOutline, 
  locationOutline, 
  settingsOutline, 
  lockClosedOutline,
  notificationsOutline,
  mailOutline,
  keyOutline,
  chevronForwardOutline,
  logOutOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-Usuario',
  templateUrl: './Usuario.page.html',
  styleUrls: ['./Usuario.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonToggle, CommonModule, FormsModule, FooterComponent, HeaderComponent]
})
export class UsuarioPage implements OnInit {
  // Información del usuario
  userName: string = 'Usuario';
  userEmail: string = 'usuario@ejemplo.com';
  userPhone: string = '';
  userAddress: string = '';
  userCity: string = '';
  userReferences: string = '';

  // Preferencias
  notificationsEnabled: boolean = true;
  emailOffersEnabled: boolean = false;

  constructor() {
    // Registrar los iconos
    addIcons({
      'person-circle-outline': personCircleOutline,
      'person-outline': personOutline,
      'location-outline': locationOutline,
      'settings-outline': settingsOutline,
      'lock-closed-outline': lockClosedOutline,
      'notifications-outline': notificationsOutline,
      'mail-outline': mailOutline,
      'key-outline': keyOutline,
      'chevron-forward-outline': chevronForwardOutline,
      'log-out-outline': logOutOutline
    });
  }

  ngOnInit() {
    // Aquí puedes cargar los datos del usuario desde un servicio
    this.loadUserData();
  }

  loadUserData() {
    // Simular carga de datos del usuario
    // En producción, esto vendría de un servicio
    console.log('Cargando datos del usuario...');
  }

  saveChanges() {
    console.log('Guardando cambios...');
    // Aquí implementarías la lógica para guardar los cambios
    alert('Cambios guardados exitosamente');
  }

  changePassword() {
    console.log('Cambiar contraseña...');
    // Aquí implementarías la lógica para cambiar la contraseña
    alert('Funcionalidad de cambio de contraseña');
  }

  logout() {
    console.log('Cerrando sesión...');
    // Aquí implementarías la lógica para cerrar sesión
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      alert('Sesión cerrada');
    }
  }

}
