import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImportListingType } from './import.type';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss'],
})
export class ImportComponent implements OnInit {
  constructor(private route: ActivatedRoute, private zone: NgZone) {
    // this.route.queryParams.subscribe((params) => {
    //   console.log('params are: ', params);
    // });
  }

  //these are only shown based if the user has loaded their closet
  loadedListings: ImportListingType[] = [
    {
      title: 'Nike premium',
      image: 'https://picsum.photos/200',
      url: '234zzz',
      marketplace: 'depop',
    },
  ];

  selectedListingsToImport: ImportListingType[] = [];

  error?: string;

  selectListing(listing: ImportListingType) {
    console.log('clicked bro: ', listing);

    this.selectedListingsToImport = this.toggle(
      this.selectedListingsToImport,
      listing,
      (i) => i.url
    );

    console.log(this.selectedListingsToImport);
  }

  ngOnInit(): void {
    console.log('Called Constructor');

    this.checkIfUserAuthorized();
  }

  onImportListing() {
    //reset
    this.selectedListingsToImport = [];

    console.log(this.selectedListingsToImport);

    //TODO
  }

  removeAtIndex = (arr: any, index: any) => {
    const copy = [...arr];
    copy.splice(index, 1);
    return copy;
  };

  toggle = (arr: any[], item: any, getValue = (item: any) => item) => {
    const index = arr.findIndex((i) => getValue(i) === getValue(item));

    //add
    if (index === -1) {
      //if user reaches maximum import length (20 bcuz too many tabs open simultaneously can hog alot of resources in chrome), don't let them add more items to the array
      if (this.selectedListingsToImport.length == 20) {
        return arr;
      }

      return [...arr, item];
    }

    //remove
    return this.removeAtIndex(arr, index);
  };

  //check auth and subscription, if success => get items
  checkIfUserAuthorized() {
    chrome.runtime.sendMessage(
      { command: 'check-auth-and-subscription' },
      (response) => {
        if (response.status == 'success') {
          this.error = null;

          fetch('https://retoolapi.dev/4SQ3f9/listing')
            .then((response) => response.json())
            .then((json) => {
              //zone to update angular manually; detect changes

              this.zone.run(() => {
                this.loadedListings = json;
              });
            });
        } else {
          console.log(response.message);

          this.zone.run(() => {
            this.error = response.message;
          });
        }
      }
    );
  }
}
