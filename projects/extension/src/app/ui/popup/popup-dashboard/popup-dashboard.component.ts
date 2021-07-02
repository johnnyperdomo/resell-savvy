import { Component, EventEmitter, NgZone, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-popup-dashboard',
  templateUrl: './popup-dashboard.component.html',
  styleUrls: ['./popup-dashboard.component.scss'],
})
export class PopupDashboardComponent implements OnInit {
  @Output() authState = new EventEmitter<boolean>(); //from parent component

  isUserSubscribed: boolean; //whether user has an active subscription with stripe

  constructor(private zone: NgZone) {}

  ngOnInit(): void {
    this.verifySubscription();
  }

  verifySubscription() {
    chrome.runtime.sendMessage(
      { command: 'check-subscription' },
      (response) => {
        //zone to update angular manually
        this.zone.run(() => {
          if (response.status == 'active') {
            this.isUserSubscribed = true;
            console.info('Popup - subscription : active');
          } else {
            this.isUserSubscribed = false;
            console.info('Popup - subscription : not active');
          }
        });
      }
    );
  }

  onLogout() {
    console.log('logout');

    // this.isUserSubscribed = !this.isUserSubscribed;
    chrome.runtime.sendMessage({ command: 'logout-auth' }, (response) => {
      if (response.status == 'success') {
        console.log('log out user');
        this.authState.emit(false); //set 'isLoggedIn' to false
      }
    });
  }
}
