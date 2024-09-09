import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IntervalService {

  constructor() { }

  // Method to start the interval and call a function every 15 minutes
  startInterval(action: () => void) {
    const intervalTime =  890000;  // 15 minutes in milliseconds

    // Call the provided action function every 15 minutes
    setInterval(() => {
      action();
    }, intervalTime);
  }
}
