import { Component, NgZone, OnInit } from '@angular/core';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
})
export class PopupComponent implements OnInit {
  isLoggedIn: boolean;

  //from child component
  changeAuthState(state: boolean) {
    this.zone.run(() => {
      this.isLoggedIn = state;
    });
  }

  constructor(private zone: NgZone) {}

  ngOnInit(): void {
    this.verifyAuthentication();
  }

  verifyAuthentication() {
    chrome.runtime.sendMessage({ command: 'check-auth' }, (response) => {
      console.log('check auth');
      //zone to update angular manually
      this.zone.run(() => {
        if (response.status == 'success') {
          this.isLoggedIn = true;
          console.info('Popup - User Logged in');
        } else {
          this.isLoggedIn = false;
          console.info('Popup - User not logged in');
        }
      });
    });
  }
}
