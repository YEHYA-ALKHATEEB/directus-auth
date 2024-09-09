import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonLabel, IonInput } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import {client} from '../repo/directus-repository/directus-repository'
import {  AuthenticationData, createFolder, createUser, login, readFiles, readFolders, readMe, readRoles, realtime, rest, staticToken,  updateUser, uploadFiles } from '@directus/sdk';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { AuthService } from '../services/auth-service/auth.service';
import { addIcons } from "ionicons";

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [FormsModule,CommonModule, NgIf, ReactiveFormsModule,IonInput, IonLabel, IonItem, IonButton, IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent],
})
export class Tab1Page  {

  email: string | undefined;
password: string | undefined;
first_name: string | undefined;
last_name: string | undefined;

 files: any;
  location: string = '';
  avatarFile: File | null = null;
  currentUser: any;
  registrationForm: FormGroup;
  authResponse:any;
  authenticatedUser: any;
  authenticatedUserId = ''
  authenticatedUserAssetDirectoryId = ''

  userId = ''
  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registrationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    // Initialize Directus instance
  }

  logout() {
    this.authService.logout();
  }
  async registration() {
    if(this.email && this.password && this.first_name && this.last_name){
          this.authService.register(this.email,this.password,this.first_name,this.last_name)
          this.authService.login(this.email,this.password)
  }
}

  async onRegister() {
    // register user
    if(this.email && this.password) {
      await client.request(
      createUser({
        email: this.email,
        password: this.password,
        first_name: this.first_name,
        last_name: this.last_name,
        role: 'a8ac5778-c9ba-42d2-8a87-554ab785bec3'

      })
    );
    // login user after registration get auth response
        this.authResponse = await client.request(login(this.email, this.password, {mode:'json'}));
 if(this.authResponse){
      // get authenticated user
      this.authenticatedUser = await client.with(staticToken(this.authResponse.access_token)).with(realtime()).request(readMe({
      fields: ['id', 'first_name', 'last_name', 'email', 'password', 'location']
  }))
// get authenticated userId
  if(this.authenticatedUser) {
    this.authenticatedUserId = this.authenticatedUser.id;

    // create director for user with name containing the username-userId
    const result = await client.with(staticToken(this.authResponse.access_token)).request(createFolder(
      {
        name: this.authenticatedUser.email,
      }
    ));





  }
}


    }




  }


// get user Asset Directory
async getUserAssetsDirectoryId(){
  const userAssetsDirectory = await client.with(staticToken(this.authResponse.access_token)).request(
    readFolders({
      fields: ['*'],
      limit: 1,
      filter: {
        name: {
          _eq: this.authenticatedUser.email,
        }
      }
    })
  );

  if(userAssetsDirectory) {
    this.authenticatedUserAssetDirectoryId = userAssetsDirectory[0]['id'];
  }
}

  async getRoles() {
    const result = await client.request(
      readRoles({
        fields: ['*'],
      })
    );
  }




   abv:AuthenticationData|null=null;
  async login() {
    this.authService.login('test@email.com', 'test')
    //  this.abv = await client.request(login('test@email.com', 'test', {mode:'json'}));
  //  const decodedToken =   this.decodeToken(this.abv.access_token)
  //   console.log('decodedToken', decodedToken)
  }


  async getCurrentUser() {
    const result = await client.with(staticToken(this.abv?.access_token!!)).with(realtime()).request(readMe({
      fields: ['id', 'first_name', 'last_name', 'email', 'password', 'location']
  }))


  console.log('result',result)
  }


  async getCurrentUserWithout() {
    const result = await client.with(staticToken(this.abv?.access_token!!)).request(readMe({
      fields: [ '*']
  }));

  this.userId = result['id'];
  }





  async update() {
    await client.with(staticToken(this.abv?.access_token!!)).request(updateUser(this.userId, {
        id: this.userId,
        first_name: 'asslan',
        last_name: 'ktib'
      } ));


}





  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const avatarFile = input.files[0];

      // Create FormData
      this.uploadAvatar(avatarFile)
    }
  }

  async  uploadAvatar(file: File) {
    await this.getUserAssetsDirectoryId();
       const formData = new FormData();
    formData.append('folder', this.authenticatedUserAssetDirectoryId);
    formData.append('file', file);
    formData.append('userId', this.userId);

    const result = await client.with(staticToken(this.abv?.access_token!!)).request(uploadFiles(formData));

  }


  async listFiles() {
    this.files = await client.with(staticToken(this.abv?.access_token!!)).request(readFiles({fields: ["*"]}));
    this.files = this.files.filter((image: { type: string; }) => image.type.startsWith('image/'));
  }

  async createFolder() {
    const result = await client.with(staticToken(this.abv?.access_token!!)).request(createFolder(
      {
        name: 'banner images',
      }
    ));

  }

  getImageUrl(filename: string): string {
    return `http://localhost:8055/assets/${filename}`;
  }
// const result = await client.request(updateUser(this.userId, {fields: []}));


}
