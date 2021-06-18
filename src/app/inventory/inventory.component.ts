import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import * as currency from 'currency.js';
import { nanoid } from 'nanoid';
import { Item } from '../shared/models/item.model';
import * as firebase from 'firebase';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { SoldDialogComponent } from '../shared/sold-dialog/sold-dialog.component';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
})
export class InventoryComponent implements OnInit {
  //LATER: paginate data so we don't pull all the items at once, as this can cause alot of reads which can become expensive later on; if i do this i have to add custom elastic search functionality, I also have to queryable data most likely from google bigquery to get 'stats' values
  //LATER: users can add their inventory to the dashboard directly(this would mean that i hve to store the images)
  //LATER: allow users to filter the table/search by price, status, condition,color, cost range, price range, dates, marketplaces, etc...
  //LATER: be more transparent and share the sold details on the item page, stating fees, etc... and maybe they can edit. This will be more apparent later on when they will need sales reports

  items: Item[];

  listedMarketplaces: string[][] = []; //iterated property

  filteredItems: any;

  storagePath: string = environment.azure.storagePath; //azure storage url for hosted images

  //stats
  itemsInInventory: number;
  activeListings: number;
  soldItems: number;
  totalSales: number;

  itemSub: Subscription;
  soldDialogSub: Subscription;

  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    //LATER: get and sort items by default based on newest first(modification date)
    this.getItems();
  }

  async onNewItem() {
    try {
      this.auth.onAuthStateChanged(async (user) => {
        let itemID = nanoid();

        await this.db.firestore
          .collection('users')
          .doc(user.uid)
          .collection('items')
          .doc(itemID)
          .set({
            id: itemID,
            title: '',
            description: '',
            status: 'draft',
            images: [],
            price: null,
            brand: '',
            condition: '',
            color: '',
            sku: '',
            cost: null,
            notes: '',
            marketplaces: {
              ebay: '',
              poshmark: '',
              mercari: '',
              facebook: '',
              etsy: '',
              tradesy: '',
              grailed: '',
              depop: '',
              kidizen: '',
            },
            sold: null,
            created: firebase.default.firestore.Timestamp.now(),
            modified: firebase.default.firestore.Timestamp.now(),
          });

        this.router.navigate([`/item/${itemID}`]);
      });
    } catch (error) {
      //LATER: make a prettier solution
      alert(error);
    }
  }

  parseCurrencyValues() {
    this.items.map((item) => {
      if (item.price) {
        //parse prices currencies: 17 => 17.00
        item.price = Number(currency(item.price).toString());
      }
      if (item.cost) {
        //parse cost currencies: 17 => 17.00
        item.cost = Number(currency(item.cost).toString());
      }
    });
  }

  getItems() {
    this.auth.onAuthStateChanged(async (user) => {
      if (user) {
        this.itemSub = this.db
          .collection('users')
          .doc(user.uid)
          .collection<Item>('items', (ref) => {
            // order by latest updated: //LATER: let user decide to order by title,price,cost etc... and also filter by price range, cost range, profit range, marketplace listed ons,etc...(Filter options)
            return ref.orderBy('modified', 'desc');
          })
          .valueChanges()
          .subscribe((data) => {
            this.items = data.map((i) => {
              //loop over listed marketplaces
              this.iterateMarketplaces(i);
              return new Item(i);
            });

            this.parseCurrencyValues();
            this.filteredItems = this.items;

            //stats
            this.itemsInInventory = this.items.length;
            this.activeListings = this.getActiveListings();
            this.soldItems = this.getSoldItems();
            this.totalSales = this.getTotalSales();
          });
      }
    });
  }

  //find listed urls of property values, then add them to array
  iterateMarketplaces(item: Item) {
    let array = [];
    for (let marketplace in item.marketplaces) {
      if (
        item.marketplaces[marketplace] != '' &&
        item.marketplaces[marketplace] != null
      ) {
        array.push(marketplace);
      }
    }
    this.listedMarketplaces[item.id] = array;
  }

  getActiveListings() {
    return this.items.filter((item) => {
      return !item.sold && item.status == 'active'; //technically still counted as active cuz its listed on a platform, but it's marked as sold.
    }).length;
  }

  getSoldItems() {
    return this.items.filter((item) => {
      return item.sold;
    }).length;
  }

  getTotalSales() {
    const soldItems = this.items.filter((item) => {
      return item.sold;
    });

    return soldItems.reduce((n, { price }) => {
      //add; currency math
      const currencyVal = currency(n).add(price).toString();
      return Number(currencyVal);
    }, 0);
  }

  onSearchKey(event) {
    const titleInput = event.target.value.toLowerCase();

    if (titleInput == '') {
      this.filteredItems = this.items;
    } else {
      //filter items by title
      this.filteredItems = this.items.filter((item) => {
        return item.title.toLowerCase().includes(titleInput);
      });
    }
  }

  onDeleteItem(itemID: string) {
    //LATER: add confirmation step
    //TODO: firebase delete item

    this.auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          await this.db
            .collection('users')
            .doc(user.uid)
            .collection('items')
            .doc(itemID)
            .delete();

          console.log('deleted item');
        } catch (error) {
          alert(error);
        }
      }
    });
  }

  onMarkItemSold(item: Item) {
    //LATER: delist items automatically later
    // TODO: modal

    this.dialog.open(SoldDialogComponent, {
      data: { item: item },
    });
  }

  onUnmarkItemSold(itemID: string) {
    this.auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          await this.db.firestore
            .collection('users')
            .doc(user.uid)
            .collection('items')
            .doc(itemID)
            .update({
              modified: firebase.default.firestore.Timestamp.now(),
              sold: null,
            });
        } catch (error) {
          alert(error);
        }
      }
    });
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this.itemSub) {
      this.itemSub.unsubscribe();
    }

    if (this.soldDialogSub) {
      this.soldDialogSub.unsubscribe();
    }
  }
}
