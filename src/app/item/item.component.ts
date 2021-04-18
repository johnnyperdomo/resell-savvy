import { Component, OnInit } from '@angular/core';
import * as Azure from '@azure/storage-blob';
import * as firebase from 'firebase';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
})
export class ItemComponent implements OnInit {
  //TODO: change status here; if they have no active listing urls, automatically mark as draft.
  //dont mark as draft even if they dfont have a listing url, only on the situation where iit is marked as 'sold', since sold will have its own sell location. ({sold, {marketplace: 'poshmark'}})

  //TODO: if an item is clicked to be listed, then automatically save the item before opening chrome extension

  constructor() {}

  ngOnInit(): void {}

  //Azure blob access token
  async getUploadSas() {
    const uploadSignature = firebase.default
      .functions()
      .httpsCallable('uploadSignature');

    try {
      let secureSignature = await uploadSignature({
        key: '123', //blob name //TODO: dynamic
      });

      console.log(secureSignature.data);
      console.log('got access token');
    } catch (error) {
      console.log(error);
    }
  } //TODO
}
