import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet, IonButton } from '@ionic/angular/standalone';
import { AuthService } from './services/auth-service/auth.service';
import { IntervalService } from './services/interval-service/interval.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonButton, IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {



  constructor(private authService: AuthService, private intervalService: IntervalService) {}
  ngOnInit(): void {
    this.intervalService.startInterval(() => this.authService.refreshAccessToken());  }


}
