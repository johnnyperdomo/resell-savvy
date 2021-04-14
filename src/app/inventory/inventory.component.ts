import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
})
export class InventoryComponent implements OnInit {
  //LATER: paginate data so we don't pull all the items at once, as this can cause alot of reads which can become expensive later on; if i do this i have to add custom elastic search functionality, I also have to queryable data most likely from google bigquery to get 'stats' values
  //TODO: make sure to manipulate date values
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
      marketplaces: ['poshmark', 'mercari', 'etsy', 'tradesy'],
    },
    {
      itemId: 'item1234',
      title: 'Adidas Blue Tshirt SM ',
      sku: null,
      imageUrl:
        'https://dashkit.goodthemes.co/assets/img/avatars/products/product-1.jpg',
      status: 'sold',
      price: '17.76',
      cost: '2.56',
      date: 'Jan 17, 2020',
      marketplaces: ['poshmark', 'mercari', 'etsy', 'grailed'],
    },
    {
      itemId: 'item1235',
      title: 'Gymshark Pants Gym Blue Limited Edition ',
      sku: null,
      imageUrl:
        'https://dashkit.goodthemes.co/assets/img/avatars/products/product-2.jpg',
      status: 'active',
      price: '234.76',
      cost: '56.56',
      date: 'Jan 19, 2020',
      marketplaces: ['poshmark', 'etsy', 'tradesy'],
    },
  ];
  constructor() {}

  ngOnInit(): void {}
}
