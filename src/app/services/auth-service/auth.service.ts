import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import {  authentication, AuthenticationData, createDirectus, createFolder, createUser, login, logout, readFiles, readFolders, readMe, refresh, rest, staticToken, updateMe } from '@directus/sdk';
import {  Observable, of } from 'rxjs';
import { UserDirectory } from 'src/app/types';


@Injectable({
  providedIn: 'root'
})


export class AuthService {
  private directusClient = createDirectus('http://localhost:8055/').with(authentication()).with(rest());

  // Signals to manage auth state
  authData = signal<AuthenticationData | null>(null);
  isLoggedIn = signal<boolean>(false);
  authenticatedUser = signal<any>(null); // Holds the user profile data
  files = signal<any>(null);

  constructor(private router: Router){

  }

  async register(email: string, password: string, firstName: string, lastName: string) {
    // register user
      await this.directusClient.request(
      createUser({
        email: email,
        password: password,
        first_name: firstName,
        last_name: lastName,
        role: 'a8ac5778-c9ba-42d2-8a87-554ab785bec3'
      })
    );

    this.login(email,password);

  }

   // Method to login the user
   async login(email: string, password: string): Promise<void> {
    try {
      // Login with Directus and get the response (tokens)
      const response = await this.directusClient.request(login(email, password, { mode: 'json' }));
      const data = response;

      // Store tokens in localStorage
      localStorage.setItem('access_token', data.access_token || '');
      localStorage.setItem('refresh_token', data.refresh_token || '');
      localStorage.setItem('token_expiry', data.expires ? (Date.now() + data.expires).toString() : '');

      // Update auth data and login status using signals
      this.authData.set(data);
      this.isLoggedIn.set(true);

      // Fetch authenticated user profile data using the access token
      if(data.access_token){
        const authenticatedUser =  await this.directusClient
        .with(staticToken(data.access_token))
        .request(readMe({
          fields: ['*'], // Add more fields as needed
        }));

        // Store user profile data in localStorage
        localStorage.setItem('authenticatedUser', JSON.stringify((authenticatedUser)));

        this.authenticatedUser.set(authenticatedUser)
      // Store the user profile data in the signal

      // Navigate to the main tabs page after successful login
      this.router.navigate(['/tabs']);
      }

    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }



  async refreshAuthToken(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    try {
      const result = await this.directusClient.refresh();

      const refreshedAuthData = await this.directusClient.request(refresh('session', refreshToken));
      this.authData.set(refreshedAuthData);

      // Update the refresh token in local storage
              localStorage.setItem('access_token', refreshedAuthData.access_token ? refreshedAuthData.access_token : '');
              localStorage.setItem('refresh_token', refreshedAuthData.refresh_token ?  refreshedAuthData.refresh_token : '');
              localStorage.setItem('token_expiry', refreshedAuthData.expires ?  (Date.now() + refreshedAuthData.expires).toString() : '');


    } catch (error) {
      console.error('Error during token refresh:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // Clear authentication data from local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token_expiry');
      localStorage.removeItem('authenticatedUser');
// Clear auth data and user profile using signals
      this.authData.set(null);
      this.authenticatedUser.set(null);
      this.isLoggedIn.set(false);      // Redirect to login page
      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error during logout:', error);
      // Handle any additional error logic if needed
    }
  }

  isAuthenticated(): Observable<boolean> {
    const isLoggedIn = !!localStorage.getItem('access_token'); // Adjust based on your logic
    return of(isLoggedIn);
  }









 // Your refresh token function


  async refreshAccessToken(): Promise<string> {
    const refresh_token =localStorage.getItem('refresh_token');
    const access_token =localStorage.getItem('access_token');
    if(access_token && refresh_token){
      try {
    const response = await this.directusClient.with(staticToken(access_token)).request(refresh('json', refresh_token))
    localStorage.setItem('access_token', response.access_token ? response.access_token : '');
    localStorage.setItem('refresh_token', response.refresh_token ?  response.refresh_token : '');
    localStorage.setItem('token_expiry', response.expires ?  (Date.now() + response.expires).toString() : '');

    return response.access_token ? response.access_token : ''
  } catch (error) {
    console.error('Error refreshing token:', error);
    // Handle error, e.g., redirect to login
    window.location.href = '/login';
  }
    }

  return ''}

// Example: Fetch user directories
async getUserDirectories(): Promise<any> {
  const accessToken = localStorage.getItem('access_token');
  if(accessToken){
    return  this.directusClient.with(staticToken(accessToken)).request(
      readFolders({
        fields: ['*'],
      })
    )
  }

}
}



