import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-listing-connect',
  templateUrl: './listing-connect.component.html',
  styleUrls: ['./listing-connect.component.scss'],
})
export class ListingConnectComponent implements OnInit {
  selectedListing = {
    listingUrl: '', //TODO: full url,
    listingID: '',
  };

  recentItems = [
    {
      image: 'https://picsum.photos/200',
      title: 'Nike pair of gym pants iv',
      sku: '123',
      price: 546,
      sold: true,
      status: 'active',
    },
    {
      image: 'https://picsum.photos/200',
      title: 'Adidas ultra rock limited edition v3',
      sku: '123',
      price: 546,
      sold: false,
      status: 'active',
    },
    {
      image: 'https://picsum.photos/200',
      title: 'Nike',
      sku: '123',
      price: 546,
      sold: false,
      status: 'draft',
    },
  ];

  constructor(private route: ActivatedRoute) {
    console.log('Called Constructor');
    this.route.queryParams.subscribe((params) => {
      console.log('params are: ', params);
    });
  }

  ngOnInit(): void {
    //TODO: 1. check if user logged in. 2. check if user paying 3. get recent items in inventory
    this.getRecentItemsFromInventory();
  }

  getRecentItemsFromInventory() {
    //TODO: get from firebase: recent 30
    fetch('https://retoolapi.dev/d9kFhN/listings')
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        this.recentItems = res;
      });
  }
}
