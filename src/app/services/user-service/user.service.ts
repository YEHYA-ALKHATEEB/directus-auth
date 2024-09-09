import { Injectable, signal } from '@angular/core';
import { authentication, createDirectus, createFolder, readFolders, rest, staticToken, updateUser } from '@directus/sdk';
import { UserDirectory } from 'src/app/types';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private directusClient = createDirectus('http://localhost:8055/').with(authentication()).with(rest());
  authenticatedUser = signal<any>(null); // Holds the user profile data

  constructor() {
    this.loadUserDataFromStorage()

  }

//  load user data from localStorage
private loadUserDataFromStorage(): void {
  const authenticatedUser = localStorage.getItem('authenticatedUser');
  if(authenticatedUser){
    this.authenticatedUser.set(JSON.parse(authenticatedUser))
  }
}

  async getUserAssetsDirectoryId(userId: string, access_token: string): Promise<string> {
    const directories = await this.directusClient.with(staticToken(access_token)).request(
      readFolders({
        fields: ['*'],
      })
    ) as UserDirectory[]; // <-- Type assertion here

    const userDirectory = directories.find(dir =>  dir.name === userId)
    console.log('UserDirectory',userDirectory);

    if(userDirectory === undefined) {
      console.log('UserDirectory',userDirectory);
     const newDirectory = await this.createUserDirectory(userId, access_token);
     return newDirectory.id
    }

    return userDirectory.id;
  }

  async createUserDirectory(userId: string, accessToken: string): Promise<UserDirectory>{
 const userDirectory = await this.directusClient.with(staticToken(accessToken)).request(createFolder(
    {
      name: userId
    }
  ));
 return userDirectory as UserDirectory;
}

async updateUser(userId: string,access_token: string, firstName?:string, lastName?:string, avatar?: string ) {
  const response =  await this.directusClient.with(staticToken(access_token)).request(updateUser(userId, {
      first_name: firstName,
      last_name: lastName
    } ));
    localStorage.setItem('authenticatedUser', JSON.stringify((response)));


}
async updateAvatar(userId: string,access_token: string, avatarId: string ) {
  const response =  await this.directusClient.with(staticToken(access_token)).request(updateUser(userId, {
    avatar: avatarId,
    } ));
    localStorage.setItem('authenticatedUser', JSON.stringify((response)));


}
}
