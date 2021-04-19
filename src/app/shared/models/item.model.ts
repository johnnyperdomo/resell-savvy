export class Item {
  public id: string; //system generated
  public sku: string; //user generated
  public title: string;
  public description: string;
  public status: string; //draft, sold, active
  public imageUrls: [string];
  public price?: number; //value or 0 when fetching property
  public cost?: number;
  public color: string;
  public size: string; //can be anything
  public brand: string;
  public tags: string; //separated by commas (,)
  public condition: string; //nwt, nwot, good, pre-owned, poor
  public zipCode?: number;
  public packageWeight: { pounds?: number; ounces?: number };
  public packageDimensions: {
    length?: number;
    width?: number;
    height?: number;
  }; //measured in inches
  public notes: string; //these are internal notes
  public marketplaces: {
    ebay: string;
    etsy: string;
    poshmark: string;
    tradesy: string;
    grailed: string;
    depop: string;
    kidizen: string;
    facebook: string;
    mercari: string;
  }; //save listing urls here, or leave empty if delisted or null: ''
  public sold?: {
    marketplace: string;
    fees?: number; //any marketplace fees
    date: firebase.default.firestore.Timestamp;
  }; //if sold => where, and what date did it sell on?
  public created: firebase.default.firestore.Timestamp;
  public modified: firebase.default.firestore.Timestamp;

  constructor(public init: Item) {
    Object.assign(this, init);
  }
}
