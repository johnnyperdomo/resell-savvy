import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-coupon-dialog',
  templateUrl: './coupon-dialog.component.html',
  styleUrls: ['./coupon-dialog.component.scss'],
})
export class CouponDialogComponent implements OnInit {
  couponForm: FormGroup;

  constructor(
    private _formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { couponCode: string }
  ) {}

  ngOnInit(): void {
    this.setupCouponForm();
  }

  setupCouponForm() {
    this.couponForm = this._formBuilder.group({
      couponCode: [''],
    });
  }
}
