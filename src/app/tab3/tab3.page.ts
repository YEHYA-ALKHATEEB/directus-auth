import { Component, effect, inject, OnInit, Signal } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonRow, IonGrid, IonCol, IonItem, IonLabel, IonInput, IonAvatar, IonCard } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { addIcons } from "ionicons";
import { cameraOutline, createOutline } from "ionicons/icons";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth-service/auth.service';
import { JsonPipe, NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { readFiles, readFolders, staticToken, uploadFiles } from '@directus/sdk';
import { client } from '../repo/directus-repository/directus-repository';
import { UserService } from '../services/user-service/user.service';


interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatarId: string;
}
@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [IonCard, IonAvatar, IonInput,FormsModule,NgFor, ReactiveFormsModule, IonLabel,NgIf, IonItem,JsonPipe, IonCol, IonGrid, IonRow, FormsModule, IonIcon, IonButton, IonButtons, IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent],
})
export class Tab3Page implements OnInit {

  files: any;
  accessToken = '';
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  userAssetsDirectory = ''
  authenticatedUserAssetDirectoryId = ''
  email=''
  first_name=''
  last_name=''
  userAvatar: any
user: UserProfile | undefined
  profileForm: FormGroup;

  authenticatedUser: Signal<UserProfile>


  constructor(private userService: UserService) {
      addIcons({createOutline, cameraOutline});

    this.profileForm = this.fb.group({
      email: [{value: '', disabled: true}, Validators.required],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required]
    });

    this.authenticatedUser = this.userService.authenticatedUser;

    effect(async () => {
      const user = this.authenticatedUser();
      if (user) {
        this.user = user;
        console.log('user', user)
        this.profileForm?.patchValue({
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name
        })
        this.email = user.email;
    this.first_name = user.first_name;
    this.last_name = user.last_name;
     this.userAssetsDirectory = await this.userService.getUserAssetsDirectoryId(user.id, localStorage.getItem('access_token')|| '')

     console.log('userAssetsDirectory',this.userAssetsDirectory)
     this.listFiles(this.user.avatarId)

      }else {
        // Optionally handle the case where user data is null (e.g., show a message or redirect)
        this.profileForm?.reset()
      }
    })
  }
  ngOnInit(): void {
    this.accessToken = localStorage.getItem('access_token') || ''
   }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const avatarFile = input.files[0];

      // Create FormData
     await this.uploadAvatar(avatarFile)
     this.listFiles(this.user?.avatarId)
    }
  }

  async  uploadAvatar(file: File) {
    await this.getUserAssetsDirectoryId();
    console.log('authenticatedUserAssetDirectoryId',this.authenticatedUserAssetDirectoryId)
    const formData = new FormData();
      if(this.user){
          formData.append('folder', this.userAssetsDirectory);
    formData.append('file', file);
    formData.append('userId', this.user.id);
    const result = await client.with(staticToken(localStorage.getItem('access_token')|| '')).request(uploadFiles(formData));
    }
  }

  async getUserAssetsDirectoryId(){
    const userAssetsDirectory = await client.with(staticToken(localStorage.getItem('access_token')|| '')).request(
      readFolders({
        fields: ['*'],
        limit: 1,
        filter: {
          name: {
            _eq: this.user?.id,
          }
        }
      })
    );

    if(userAssetsDirectory) {
      this.authenticatedUserAssetDirectoryId = userAssetsDirectory[0]['id'];
    }
  }

  async listFiles(avatarId?: string) {

        this.files = await client.with(staticToken(localStorage.getItem('access_token')|| '')).request(readFiles({fields: ["*"]}));
    this.files = this.files.filter((image: { type: string; }) => image.type.startsWith('image/'));
    this.userAvatar =  this.files.find((file: { id: string;}) => file.id === avatarId);
    console.log('this.userAvatar', this.userAvatar);


    }

    getUserAvatar(avatarId: string): string{
      if(this.files){
        this.userAvatar =  this.files.find((file: { id: string;}) => file.id === avatarId);
        return this.userAvatar.filename_disk;
      }
      return ''
    }


  getImageUrl(filename: string): string {
    return `http://localhost:8055/assets/${filename}`;
    }

    async updateUser(id: string,first_name: string, last_name:string){
        // const updatedUserData = this.profileForm.value;
        // console.log('updatedUserData', updatedUserData)
        this.userService.updateUser(id,this.accessToken, first_name,last_name)

    }

    refreshToken() {
      this.authService.refreshAccessToken()
    }

    setAvatar(id:string, avatarId: string) {
      this.userService.updateAvatar(id,this.accessToken, avatarId, )
      }

}
