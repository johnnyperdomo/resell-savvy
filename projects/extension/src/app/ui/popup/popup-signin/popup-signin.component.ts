import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-popup-signin',
  templateUrl: './popup-signin.component.html',
  styleUrls: ['./popup-signin.component.scss'],
})
export class PopupSigninComponent implements OnInit {
  @Output() authState = new EventEmitter<boolean>(); //from parent component

  loginForm: FormGroup;

  isLoading: boolean;

  constructor(private _formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.setupLoginForm();
  }

  setupLoginForm() {
    this.loginForm = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  //signin
  async onSubmit() {
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;

    console.log(email, password);

    try {
      chrome.runtime.sendMessage(
        {
          command: 'signin-auth',
          data: { email: email, password: password },
        },
        (response) => {
          if (response.status == 'error') {
            alert(response.message.message);
          } else if (response.status == 'success') {
            console.info('Popup - Login Success');
            this.authState.emit(true); //set 'isLoggedIn' to true
          }
        }
      );
    } catch (error) {
      alert(error.message);
      this.isLoading = false;
    }
  }
}
