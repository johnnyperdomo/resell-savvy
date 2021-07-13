import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MarketplaceType } from '../../marketplace.type';
import { ImportListingType } from './import.type';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss'],
})
export class ImportComponent implements OnInit {
  marketplace: MarketplaceType;
  tabId: number; //tabid of the closet we are on

  constructor(private route: ActivatedRoute, private zone: NgZone) {
    this.route.queryParams.subscribe((params) => {
      console.log('params are: ', params);
      this.marketplace = params.marketplace;
      this.tabId = Number(params.tabId);

      console.log('tab id is: ', this.tabId);
    });
  }

  //these are only shown based if the user has loaded their closet
  loadedListings: ImportListingType[] = [];

  selectedListingsToImport: ImportListingType[] = [];

  error?: string;

  selectListing(listing: ImportListingType) {
    console.log('clicked bro: ', listing);

    this.selectedListingsToImport = this.toggle(
      this.selectedListingsToImport,
      listing,
      (i) => i.id
    );

    console.log(this.selectedListingsToImport);
  }

  ngOnInit(): void {
    this.checkIfUserAuthorized();
    // chrome.runtime.sendMessage({ greeting: 'hello' }, function (response) {
    //   console.log(response.farewell);
    // });
  }

  onImportListing() {
    //1. start import session
    this.selectedListingsToImport.map((listing) => {
      //TODO: add real data
      chrome.runtime.sendMessage({
        command: `start-import-session`,
        data: {
          listingUrl: listing.url,
          listingId: listing.id,
          marketplace: this.marketplace,
        },
      });
    });

    //2. reset table
    this.selectedListingsToImport = [];

    console.log(this.selectedListingsToImport);
    //TODO
  }

  removeAtIndex = (arr: any, index: any) => {
    const copy = [...arr];
    copy.splice(index, 1);
    return copy;
  };

  //add/remove item from array
  toggle = (arr: any[], item: any, getValue = (item: any) => item) => {
    const index = arr.findIndex((i) => getValue(i) === getValue(item));

    //add item
    if (index === -1) {
      //if user reaches maximum import length (20 bcuz too many tabs open simultaneously can hog alot of resources in chrome), don't let them add more items to the array
      if (this.selectedListingsToImport.length == 20) {
        return arr;
      }

      return [...arr, item];
    }

    //remove item
    return this.removeAtIndex(arr, index);
  };

  //check auth and subscription, if success => get items
  checkIfUserAuthorized() {
    chrome.runtime.sendMessage(
      { command: 'check-auth-and-subscription' },
      (response) => {
        if (response.status == 'success') {
          this.error = null;

          // fetch('https://retoolapi.dev/4SQ3f9/listing')
          //   .then((response) => response.json())
          //   .then((json) => {
          //     //zone to update angular manually; detect changes

          //     this.zone.run(() => {
          //       this.loadedListings = json;
          //     });
          //   });
          this.getLoadedListingsFromContentScript();
        } else {
          console.log(response.message);

          this.zone.run(() => {
            this.error = response.message;
          });
        }
      }
    );
  }

  //send message to content script in corresponding tab, and scan the page for listings
  getLoadedListingsFromContentScript() {
    chrome.tabs.sendMessage(this.tabId, { command: 'get-listings' }, (res) => {
      console.log('loaded listing res is => ', res.data.listings);

      //closet listings return {title?, image?, url?}; url is just the urlPath
      let listings = res.data.listings.map(
        (listing: { title?: string; image?: string; url?: string }) => {
          let listingInfo = this.extractIDFromPathAndCreateFullUrl(
            listing.url,
            this.marketplace
          );

          let _title = listing.title;
          let _image = listing.image; //thumbnail
          let _url = listingInfo.url; //full marketplace listing url + id
          let _id = listingInfo.extractedID; //listing url

          return {
            title: _title,
            image: _image,
            url: _url,
            id: _id,
          };
        }
      );

      this.zone.run(() => {
        this.loadedListings = listings;
      });

      console.log(this.loadedListings);
    });
  }

  //urls of the marketplace listings
  marketplaceListingUrls = {
    depop: 'https://www.depop.com/products/',
    ebay: 'https://www.ebay.com/itm/',
    etsy: 'https://www.etsy.com/listing/',
    grailed: 'https://www.grailed.com/listings/',
    kidizen: 'https://www.kidizen.com/items/',
    mercari: 'https://www.mercari.com/us/item/', //LATER: don't only work for ''us
    poshmark: 'https://www.poshmark.com/listing/',
  };

  //extracts the id from the url path(not a full url), then it creates a full url path
  extractIDFromPathAndCreateFullUrl(
    urlPath: string,
    marketplace: MarketplaceType
  ) {
    switch (marketplace) {
      case 'depop':
        if (urlPath === '') {
          return null;
        }

        let depopID = urlPath.split('products/').pop().split('/')[0]; //gets -> item-id

        let depopFullUrl = this.marketplaceListingUrls[marketplace] + depopID; //marketplace url + id

        return { url: depopFullUrl, extractedID: depopID };

      case 'ebay':
        if (urlPath === '') {
          return null;
        }

        let ebayID = urlPath.split('itm/').pop().split('/')[0]; //gets -> 1234

        let ebayFullUrl = this.marketplaceListingUrls[marketplace] + ebayID; //marketplace url + id

        return { url: ebayFullUrl, extractedID: ebayID };

      case 'etsy':
        if (urlPath === '') {
          return null;
        }

        let etsyID = urlPath.split('listings/').pop().split('/')[0]; //gets -> 1234 //'etsy closet manager tool' has a slightly different path

        let etsyFullUrl = this.marketplaceListingUrls[marketplace] + etsyID; //marketplace url + id

        return { url: etsyFullUrl, extractedID: etsyID };

      case 'grailed':
        if (urlPath === '') {
          return null;
        }

        let grailedID = urlPath
          .split('listings/')
          .pop()
          .split('-')[0]
          .split('/')[0]; //gets -> 1234

        let grailedFullUrl =
          this.marketplaceListingUrls[marketplace] + grailedID; //marketplace url + id

        return { url: grailedFullUrl, extractedID: grailedID };

      case 'kidizen':
        if (urlPath === '') {
          return null;
        }

        let kidizenID = urlPath
          .split('items/')
          .pop()
          .split('-')
          .pop()
          .split('/')[0]; //gets -> 1234

        let kidizenFullUrl =
          this.marketplaceListingUrls[marketplace] + kidizenID; //marketplace url + id

        return { url: kidizenFullUrl, extractedID: kidizenID };

      case 'mercari':
        if (urlPath === '') {
          return null;
        }

        let mercariID = urlPath.split('item/').pop().split('/')[0]; //gets -> 1234

        let mercariFullUrl =
          this.marketplaceListingUrls[marketplace] + mercariID; //marketplace url + id

        return { url: mercariFullUrl, extractedID: mercariID };

      case 'poshmark':
        if (urlPath === '') {
          return null;
        }

        let poshmarkID = urlPath
          .split('listing/')
          .pop()
          .split('-')
          .pop()
          .split('/')[0]; //gets -> 1234

        let poshmarkFullUrl =
          this.marketplaceListingUrls[marketplace] + poshmarkID; //marketplace url + id

        return { url: poshmarkFullUrl, extractedID: poshmarkID };
    }
  }
}
