import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
})
export class PopupComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    console.log('popup init');

    chrome.runtime.sendMessage({ command: 'check-auth' }, (response) => {
      console.log('check auth');
      console.log(response);

      if (response.status == 'success') {
        console.log('auth sucess on popup');
      } else {
        console.log('auth error on popup');

        // loggedIn = false;
        // validateAuth();
      }
    });
  }
}
