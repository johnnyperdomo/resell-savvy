export class User {
  public userID: string;
  public firstName: string;
  public lastName: string;
  public email: string;
  public stripeId: string;
  public stripeLink: string;
  public created: firebase.default.firestore.Timestamp;

  constructor(public init: User) {
    Object.assign(this, init);
  }
}
