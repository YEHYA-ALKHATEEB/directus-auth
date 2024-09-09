import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonItem, IonCard, IonCardHeader, IonInput } from '@ionic/angular/standalone';
import { addIcons } from "ionicons";
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth-service/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonCard,IonCardHeader, IonButton,FormsModule,IonInput, IonContent, IonHeader,IonItem,RouterLink,  IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class LoginPage {
  email: string | undefined;
  password: string | undefined;



  constructor(private authService: AuthService) { }



  async login() {
    if(this.email && this.password) {
          await this.authService.login(this.email, this.password);
    }
    }
}
