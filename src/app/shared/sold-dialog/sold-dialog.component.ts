import { Component, Inject, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Item } from '../models/item.model';
import * as firebase from 'firebase';

@Component({
  selector: 'app-sold-dialog',
  templateUrl: './sold-dialog.component.html',
  styleUrls: ['./sold-dialog.component.scss'],
})
export class SoldDialogComponent implements OnInit {
  soldForm: FormGroup;

  constructor(
    private _formBuilder: FormBuilder,
    private matDialog: MatDialog,
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    @Inject(MAT_DIALOG_DATA) public data: { item: Item }
  ) {}

  ngOnInit(): void {
    this.setupSoldForm();
    console.log('dialog opened ', this.data.item.id);
  }

  setupSoldForm() {
    this.soldForm = this._formBuilder.group({
      marketplace: [''],
      sellPrice: [this.data.item.price],
      fees: [null],
    });
  }

  onCancel() {
    this.matDialog.closeAll();
    console.log('canceled pressed');
  }

  async onSubmit() {
    const marketplace = this.soldForm.value.marketplace;
    const sellPrice = this.soldForm.value.sellPrice;
    const fees = this.soldForm.value.fees;

    this.auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          await this.db.firestore
            .collection('users')
            .doc(user.uid)
            .collection('items')
            .doc(this.data.item.id)
            .update({
              price: sellPrice,
              sold: {
                marketplace: marketplace,
                fees: fees,
                date: firebase.default.firestore.Timestamp.now(),
              },
            });

          this.matDialog.closeAll();
        } catch (error) {
          alert(error);
        }
      }
    });
  }
}
