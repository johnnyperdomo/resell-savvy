import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Item } from '../../item.model';
import { MarketplaceType } from '../../marketplace.type';

@Component({
  selector: 'app-listing-connect',
  templateUrl: './listing-connect.component.html',
  styleUrls: ['./listing-connect.component.scss'],
})
export class ListingConnectComponent implements OnInit {
  //LATER: show loading spinner while waiting for item to load
  selectedListing: {
    listingUrl: string;
    listingID: string;
    marketplace: string;
  };

  recentItems: any[]; //items in inventory (recent 30)

  listedMarketplaces: string[][] = []; //iterated property
  azureStoragePath: string; //azure storage url for hosted images

  constructor(private route: ActivatedRoute, private zone: NgZone) {
    this.route.queryParams.subscribe((params) => {
      if (params.url && params.marketplace) {
        let { url, extractedID } = this.extractMarketplaceValue(
          params.url,
          params.marketplace
        );

        this.selectedListing = {
          listingUrl: url,
          listingID: extractedID,
          marketplace: params.marketplace,
        };
      } else {
        alert('There was an error processing this request. Please try again.');
      }
    });
  }

  ngOnInit(): void {
    this.getRecentItemsFromInventory();
  }

  getRecentItemsFromInventory() {
    chrome.runtime.sendMessage(
      { command: 'fetch-inventory-items' },
      (response) => {
        if (response.status == 'success') {
          let items = response.message.items; //items

          items.map((item: any) => {
            //loop over listed marketplaces
            this.iterateMarketplaces(item);
          });

          console.log(this.listedMarketplaces);

          //zone to update angular manually; detect changes
          this.zone.run(() => {
            this.azureStoragePath = response.message.azureStoragePath;
            this.recentItems = items;
          });

          console.log('items are: ', this.recentItems);
        } else {
          //TODO: show error message
          console.log(response.message);
        }
      }
    );
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

  extractMarketplaceValue(url: string, marketplace: MarketplaceType) {
    switch (marketplace) {
      case 'depop':
        if (url === '') {
          return null;
        }

        //convert to URL -> get extract pathname
        let depopPath = new URL(url).pathname; // '/products/item-id/'
        let depopID = depopPath.split('products/').pop().split('/')[0]; //gets -> item-id

        return { url, extractedID: depopID };

      case 'ebay':
        if (url === '') {
          return null;
        }

        //convert to URL -> get extract pathname
        let ebayPath = new URL(url).pathname; // '/itm/1234'
        let ebayID = ebayPath.split('itm/').pop().split('/')[0]; //gets -> 1234

        return { url, extractedID: ebayID };

      case 'etsy':
        if (url === '') {
          return null;
        }

        let etsyPath = new URL(url).pathname; // '/listing/1234/product-name'
        let etsyID = etsyPath.split('listing/').pop().split('/')[0]; //gets -> 1234

        return { url, extractedID: etsyID };

      case 'grailed':
        if (url === '') {
          return null;
        }

        let grailedPath = new URL(url).pathname; // '/listings/1234-product-name'
        let grailedID = grailedPath
          .split('listings/')
          .pop()
          .split('-')[0]
          .split('/')[0]; //gets -> 1234

        return { url, extractedID: grailedID };

      case 'kidizen':
        if (url === '') {
          return null;
        }

        let kidizenPath = new URL(url).pathname; // '/items/product-name-1234'
        let kidizenID = kidizenPath
          .split('items/')
          .pop()
          .split('-')
          .pop()
          .split('/')[0]; //gets -> 1234

        return { url, extractedID: kidizenID };

      case 'mercari':
        if (url === '') {
          return null;
        }

        let mercariPath = new URL(url).pathname; // 'us/item/1234/'
        let mercariID = mercariPath.split('item/').pop().split('/')[0]; //gets -> 1234

        return { url, extractedID: mercariID };

      case 'poshmark':
        if (url === '') {
          return null;
        }

        let poshmarkPath = new URL(url).pathname; // '/listing/product-name-1234'
        let poshmarkID = poshmarkPath
          .split('listing/')
          .pop()
          .split('-')
          .pop()
          .split('/')[0]; //gets -> 1234

        return { url, extractedID: poshmarkID };
    }
  }
}
