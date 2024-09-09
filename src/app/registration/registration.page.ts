import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonButton, IonCard, IonCardHeader, IonInput } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth-service/auth.service';
import { addIcons } from "ionicons";
import { client } from '../repo/directus-repository/directus-repository';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
  standalone: true,
  imports: [IonCardHeader,IonTitle,FormsModule,IonInput,RouterLink,  IonCard, IonItem, IonContent, IonHeader,IonLabel, IonButton, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class RegistrationPage  {

  email: string | undefined;
  password: string | undefined;
  firstName: string | undefined;
  lastName: string | undefined;

  constructor(private authService: AuthService) { }



  async registration() {
    if(this.email && this.password && this.firstName && this.lastName){
         await this.authService.register(this.email,this.password,this.firstName,this.lastName)
          this.authService.login(this.email,this.password)
  }
}


refreshToken() {
  this.authService.refreshAccessToken()
}

}
