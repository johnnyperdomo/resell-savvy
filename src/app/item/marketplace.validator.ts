import { AbstractControl } from '@angular/forms';
import { url } from 'node:inspector';

export class MarketplaceUrlValidation {
  //depop
  static ConfirmDepopListingURL(AC: AbstractControl) {
    const urlControl = AC.get('depop');

    let regex = new RegExp('(depop).com/products/.+'); //checks if marketplace listing url is valid
    let isUrlValid = regex.test(urlControl.value); //checks the url against the regex, and returns a boolean

    if (urlControl.value != '' && isUrlValid === false) {
      urlControl.setErrors({ UrlInvalid: true });
    } else {
      if (urlControl.hasError('UrlInvalid')) {
        urlControl.setErrors({ UrlInvalid: null });
        urlControl.updateValueAndValidity();
      }
      return null;
    }
  }

  //etsy
  static ConfirmEtsyListingURL(AC: AbstractControl) {
    const urlControl = AC.get('etsy');

    let regex = new RegExp('(etsy).com/listing/.+'); //checks if marketplace listing url is valid
    let isUrlValid = regex.test(urlControl.value); //checks the url against the regex, and returns a boolean

    if (urlControl.value != '' && isUrlValid === false) {
      urlControl.setErrors({ UrlInvalid: true });
    } else {
      if (urlControl.hasError('UrlInvalid')) {
        urlControl.setErrors({ UrlInvalid: null });
        urlControl.updateValueAndValidity();
      }
      return null;
    }
  }

  //ebay
  static ConfirmEbayListingURL(AC: AbstractControl) {
    const urlControl = AC.get('ebay');

    let regex = new RegExp('(ebay).com/itm/.+'); //checks if marketplace listing url is valid
    let isUrlValid = regex.test(urlControl.value); //checks the url against the regex, and returns a boolean

    if (urlControl.value != '' && isUrlValid === false) {
      urlControl.setErrors({ UrlInvalid: true });
    } else {
      if (urlControl.hasError('UrlInvalid')) {
        urlControl.setErrors({ UrlInvalid: null });
        urlControl.updateValueAndValidity();
      }
      return null;
    }
  }

  //grailed
  static ConfirmGrailedListingURL(AC: AbstractControl) {
    const urlControl = AC.get('grailed');

    let regex = new RegExp('(grailed).com/listings/.+'); //checks if marketplace listing url is valid
    let isUrlValid = regex.test(urlControl.value); //checks the url against the regex, and returns a boolean

    if (urlControl.value != '' && isUrlValid === false) {
      urlControl.setErrors({ UrlInvalid: true });
    } else {
      if (urlControl.hasError('UrlInvalid')) {
        urlControl.setErrors({ UrlInvalid: null });
        urlControl.updateValueAndValidity();
      }
      return null;
    }
  }

  //kidizen
  static ConfirmKidizenListingURL(AC: AbstractControl) {
    const urlControl = AC.get('kidizen');

    let regex = new RegExp('(kidizen).com/items/.+'); //checks if marketplace listing url is valid
    let isUrlValid = regex.test(urlControl.value); //checks the url against the regex, and returns a boolean

    if (urlControl.value != '' && isUrlValid === false) {
      urlControl.setErrors({ UrlInvalid: true });
    } else {
      if (urlControl.hasError('UrlInvalid')) {
        urlControl.setErrors({ UrlInvalid: null });
        urlControl.updateValueAndValidity();
      }
      return null;
    }
  }

  //mercari
  static ConfirmMercariListingURL(AC: AbstractControl) {
    const urlControl = AC.get('mercari');

    //LATER: take other countries into consideration
    let regex = new RegExp('(mercari).com/us/item/.+'); //checks if marketplace listing url is valid
    let isUrlValid = regex.test(urlControl.value); //checks the url against the regex, and returns a boolean

    if (urlControl.value != '' && isUrlValid === false) {
      urlControl.setErrors({ UrlInvalid: true });
    } else {
      if (urlControl.hasError('UrlInvalid')) {
        urlControl.setErrors({ UrlInvalid: null });
        urlControl.updateValueAndValidity();
      }
      return null;
    }
  }

  //poshmark
  static ConfirmPoshmarkListingURL(AC: AbstractControl) {
    const urlControl = AC.get('poshmark');

    let regex = new RegExp('(poshmark).com/listing/.+'); //checks if marketplace listing url is valid
    let isUrlValid = regex.test(urlControl.value); //checks the url against the regex, and returns a boolean

    if (urlControl.value != '' && isUrlValid === false) {
      urlControl.setErrors({ UrlInvalid: true });
    } else {
      if (urlControl.hasError('UrlInvalid')) {
        urlControl.setErrors({ UrlInvalid: null });
        urlControl.updateValueAndValidity();
      }
      return null;
    }
  }
}
