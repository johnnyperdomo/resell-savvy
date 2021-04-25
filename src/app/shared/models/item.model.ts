export class Item {
  public id: string; //system generated
  public sku: string; //user generated
  public title: string;
  public description: string;
  public status: string; //draft, sold, active
  public images: [
    {
      uploadDate: firebase.default.firestore.Timestamp;
      blobID: string; //unique id of blob in Azure
      blobContainer: string; //container of blob; should be 'item-images'
      imageName: string;
      imageSize: number; //in bytes //6mb file size max
    }
  ];
  public price?: number; //value or 0 when fetching property
  public cost?: number;
  public color: string;
  public brand: string;
  public condition: string; //nwt, nwot, good, pre-owned, poor
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

//Note: we won't have specifics such as packaging details, sizes, or tags. (mostly because inputing them on form fields is very complex since there are so many different use cases/variables when it comes to categories/Brands. also they require special dropdown and native browser elements to pull off, which can get very complex. Also, depending on what the user is reselling, different items have different requirements. So just keep it generic.)
