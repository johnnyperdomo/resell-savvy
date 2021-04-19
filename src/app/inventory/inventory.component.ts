import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import * as currency from 'currency.js';
import { nanoid } from 'nanoid';
import { Item } from '../shared/models/item.model';
import * as firebase from 'firebase';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
})
export class InventoryComponent implements OnInit {
  //LATER: paginate data so we don't pull all the items at once, as this can cause alot of reads which can become expensive later on; if i do this i have to add custom elastic search functionality, I also have to queryable data most likely from google bigquery to get 'stats' values
  //TODO: make sure to manipulate date values
  //LATER: users can add their inventory to the dashboard directly(this would mean that i hve to store the images)
  //LATER: allow users to filter the table/search by price, status, dates, marketplaces, etc...

  //TODO: when getting marketplaces, if string is empty, don't show. That means there isn't a listing url for that marketplace, meaning there isn't any url associated with that marketplace.
  //TODO: make of type 'ITEM'
  items: Item[];

  listedMarketplaces: string[][] = []; //iterated property

  filteredItems: any;

  //stats
  itemsInInventory: number;
  activeListings: number;
  soldItems: number;
  totalSales: number;

  itemSub: Subscription;

  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private router: Router
  ) {}

  ngOnInit(): void {
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
            imageUrls: [],
            price: null,
            brand: '',
            condition: '',
            size: '',
            primaryColor: '',
            itemTags: '',
            sku: '',
            packageWeight: { pounds: null, ounces: null },
            packageDimensions: {
              length: null,
              width: null,
              height: null,
            },
            zipCode: null,
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
        //TODO: value or type 0
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
          .collection<Item>('items')
          .valueChanges()
          .subscribe((data) => {
            //TODO: does this just push the objects, or wait till objects finish mapping before pushing, check later with multiple items in array, we dont want the push effect, we want the wait effect
            this.items = data.map((i) => {
              console.log(i);

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
      if (item.marketplaces[marketplace] != '') {
        array.push(marketplace);
      }
    }
    this.listedMarketplaces[item.id] = array;
    console.log(this.listedMarketplaces);
  }

  getActiveListings() {
    return this.items.filter((item) => {
      return item.status == 'active';
    }).length;
  }

  getSoldItems() {
    return this.items.filter((item) => {
      return item.status == 'sold';
    }).length;
  }

  getTotalSales() {
    const soldItems = this.items.filter((item) => {
      return item.status == 'sold';
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
  }

  onMarkItemSold() {
    // TODO: modal
  }

  onUnmarkItemSold() {
    //TODO: modal
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this.itemSub) {
      this.itemSub.unsubscribe();
    }
  }
}
