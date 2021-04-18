import { Component, OnInit } from '@angular/core';
import * as currency from 'currency.js';
import { Item } from '../shared/models/item.model';

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
  items = [
    {
      id: 'item123',
      title: 'NIKE Black Tshirt XL Premium',
      sku: '7684JJ',
      imageUrls: [
        'https://dashkit.goodthemes.co/assets/img/avatars/products/product-3.jpg',
      ],
      status: 'sold',
      price: 15,
      cost: 2,
      marketplaces: {
        ebay: '',
        mercari: '',
        poshmark: 'https://',
        etsy: '',
        kidizen: '',
        depop: '',
        facebook: '',
        tradesy: '',
        grailed: '',
      },
    },
    {
      itemId: 'item1234',
      title: 'Adidas Blue Tshirt SM ',
      sku: null,
      imageUrl:
        'https://dashkit.goodthemes.co/assets/img/avatars/products/product-1.jpg',
      status: 'active',
      price: '17',
      cost: '2',
      date: 'Jan 17, 2020',
      marketplaces: [
        'mercari',
        'ebay',
        'etsy',
        'tradesy',
        'facebook',
        'grailed',
        'depop',
        'poshmark',
        'kidizen',
      ],
    },
    {
      itemId: 'item1235',
      title: 'Gymshark Pants Gym Blue Limited Edition ',
      sku: null,
      imageUrl: null,
      status: 'draft',
      price: '234.76',
      cost: '56.56',
      date: 'Jan 19, 2020',
      marketplaces: [],
    },
  ];

  filteredItems: any;

  //stats
  itemsInInventory: number;
  activeListings: number;
  soldItems: number;
  totalSales: number;

  constructor() {}

  ngOnInit(): void {
    this.parseCurrencyValues();
    this.filteredItems = this.items;

    //stats
    this.itemsInInventory = this.items.length;
    this.activeListings = this.getActiveListings();
    this.soldItems = this.getSoldItems();
    this.totalSales = this.getTotalSales();
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
}
