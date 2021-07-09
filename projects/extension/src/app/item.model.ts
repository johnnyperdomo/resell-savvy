export class Item {
  public id: string; //system generated
  public sku: string; //user generated
  public title: string;
  public searchableIndex: string[]; //used to generate keywords from the title to be able to search through later
  public description: string;
  public status: string; //draft, active. sold status is set based on sold object below
  public images: [
    {
      uploadDate: Date;
      blobID: string; //unique id of blob in Azure
      blobContainer: string; //container of blob; should be 'item-images'
      imageName: string;
      imageSize: number; //in bytes //6mb file size max
    }
  ];
  public price?: number; //value or 0 when fetching property
  public cost?: number;
  public profit?: number; //calculated from price - (cost + fees)
  public color: string;
  public brand: string;
  public condition: string; //nwt, nwot, good, pre-owned, poor
  public notes: string; //these are internal notes
  //LATER: later on, you can add "other", to marketplaces, since user might sell outside of these specific marketplace sometimes, they might sell on offerup, or they might sell it to their friends. On other field, you can also let them specificy a specific name if they want. No regex necessary. (add other icon image)
  public marketplaces?: {
    ebay?: {
      url: string;
      extractedID: string;
    };
    etsy?: {
      url: string;
      extractedID: string;
    };
    poshmark?: {
      url: string;
      extractedID: string;
    };
    grailed?: {
      url: string;
      extractedID: string;
    };
    depop?: {
      url: string;
      extractedID: string;
    };
    kidizen?: {
      url: string;
      extractedID: string;
    };
    facebook?: {
      url: string;
      extractedID: string;
    };
    mercari?: {
      url: string;
      extractedID: string;
    };
    tradesy?: {
      url: string;
      extractedID: string;
    };
  }; //save listing urls here, or leave empty if delisted or null: ''
  public sold?: {
    marketplace: string;
    fees?: number; //any marketplace fees
    date: Date;
  }; //if sold => where, and what date did it sell on?
  public created: Date;
  public modified: Date;

  constructor(public init: Item) {
    Object.assign(this, init);
  }
}
