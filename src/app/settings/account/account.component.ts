import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { User } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  constructor(private db: AngularFirestore, private auth: AngularFireAuth) {}

  userSub: Subscription;
  user: User;

  ngOnInit(): void {
    this.getAccountInfo();
  }

  getAccountInfo() {
    this.auth.onAuthStateChanged(async (user) => {
      if (user) {
        this.userSub = this.db
          .collection('users')
          .doc<User>(user.uid)
          .valueChanges()
          .subscribe((data) => {
            data.email = user.email;
            this.user = new User(data);
          });
      }
    });
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}
