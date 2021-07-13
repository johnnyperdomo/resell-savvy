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

// /**
//  * Temporary workaround for secondary monitors on MacOS where redraws don't happen
//  * @See https://bugs.chromium.org/p/chromium/issues/detail?id=971701
//  */
// if (
//   // From testing the following conditions seem to indicate that the popup was opened on a secondary monitor
//   window.screenLeft < 0 ||
//   window.screenTop < 0 ||
//   window.screenLeft > window.screen.width ||
//   window.screenTop > window.screen.height
// ) {
//   chrome.runtime.getPlatformInfo(function (info) {
//     if (info.os === 'mac') {
//       const fontFaceSheet = new CSSStyleSheet();
//       fontFaceSheet.insertRule(`
//         @keyframes redraw {
//           0% {
//             opacity: 1;
//           }
//           100% {
//             opacity: .99;
//           }
//         }
//       `);
//       fontFaceSheet.insertRule(`
//         html {
//           animation: redraw 1s linear infinite;
//         }
//       `);
//       //LATER: //FIX: adopted style sheets don't seem to work
//       document.adoptedStyleSheets = [
//         ...document.adoptedStyleSheets,
//         fontFaceSheet,
//       ];
//     }
//   });
// }
