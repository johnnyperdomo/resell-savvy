export class Coupon {
  public id: string;
  public description: string;
  public displayText: string;
  public newCustomersOnly: boolean;
  public redemptions: number;
  public type?: 'trialLength' | 'percentage';
  public trialLength?: number;
  public createdBy: 'firebase' | 'stripe'; //was the coupon code created in firebase or stripe

  constructor(public init: Coupon) {
    Object.assign(this, init);
  }
}
