import { Component, OnInit } from '@angular/core';
import * as currency from 'currency.js';

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
  items = [
    {
      itemId: 'item123',
      title: 'NIKE Black Tshirt XL Premium',
      sku: '7684JJ',
      imageUrl:
        'https://dashkit.goodthemes.co/assets/img/avatars/products/product-3.jpg',
      status: 'sold',
      price: '15.76',
      cost: '4.56',
      date: 'Jan 18, 2020',
      marketplaces: ['etsy', 'facebook', 'kidizen'],
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
        item.price = currency(item.price).toString();
      }
      if (item.cost) {
        //parse cost currencies: 17 => 17.00
        item.cost = currency(item.cost).toString();
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
