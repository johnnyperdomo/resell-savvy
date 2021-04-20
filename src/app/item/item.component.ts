import { Component, OnInit } from '@angular/core';
import * as Azure from '@azure/storage-blob';
import * as firebase from 'firebase';
import * as Uppy from '@uppy/core';
import { nanoid } from 'nanoid';
import * as FileInput from '@uppy/file-input';
import { environment } from 'src/environments/environment';
import * as Compressor from 'compressorjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Item } from '../shared/models/item.model';
import { Subscription } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
})

//LATER: have a more sophisticated file upload system, maybe uusing filepond library with image previews? idk
//LATER: if user clicks cancel button is about to leave page, have a prompt that says, are you sure want to leave without saving, to make sure they don't lose their progress?
export class ItemComponent implements OnInit {
  //TODO: change status here; if they have no active listing urls, automatically mark as draft.
  //dont mark as draft even if they dfont have a listing url, only on the situation where iit is marked as 'sold', since sold will have its own sell location. ({sold, {marketplace: 'poshmark'}})

  //TODO: if an item is clicked to be listed, then automatically save the item before opening chrome extension

  itemForm: FormGroup;

  item: Item;
  itemSub: Subscription;

  routeSub: Subscription;

  uppy: Uppy.Uppy<Uppy.TypeChecking>;

  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private route: ActivatedRoute,
    private _formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.setupItemForm();
    this.initializeFileUploader();

    this.routeSub = this.route.paramMap.subscribe((params) => {
      this.getItem(params.get('item-id'));
    });
  }

  setupItemForm() {
    //LATER: have price/number validator
    this.itemForm = this._formBuilder.group({
      title: [''],
      description: [''],
      price: [null],
      brand: [''],
      condition: [''],
      size: [''],
      primaryColor: [''],
      itemTags: [''],
      sku: [''],
      packagePound: [null],
      packageOunce: [null],
      packageLength: [null],
      packageWidth: [null],
      packageHeight: [null],
      zipCode: [],
      cost: [null],
      notes: [''],
      ebay: [''],
      poshmark: [''],
      mercari: [''],
      facebook: [''],
      etsy: [''],
      tradesy: [''],
      grailed: [''],
      depop: [''],
      kidizen: [''],
    });
  }

  patchItemForm(item: Item) {
    this.itemForm.patchValue({
      title: item.title,
      description: item.description,
      price: item.price,
      brand: item.brand,
      condition: item.condition,
      size: item.size,
      primaryColor: item.color,
      itemTags: item.tags,
      sku: item.sku,
      packagePound: item.packageWeight.pounds,
      packageOunce: item.packageWeight.ounces,
      packageLength: item.packageDimensions.length,
      packageWidth: item.packageDimensions.width,
      packageHeight: item.packageDimensions.height,
      zipCode: item.zipCode,
      cost: item.cost,
      notes: item.notes,
      ebay: item.marketplaces.ebay,
      poshmark: item.marketplaces.poshmark,
      mercari: item.marketplaces.mercari,
      facebook: item.marketplaces.facebook,
      etsy: item.marketplaces.etsy,
      tradesy: item.marketplaces.tradesy,
      grailed: item.marketplaces.grailed,
      depop: item.marketplaces.depop,
      kidizen: item.marketplaces.kidizen,
    });
  }

  initializeFileUploader() {
    //TODO: if user has 16 images, disable button
    this.uppy = Uppy({
      autoProceed: false,
      restrictions: {
        allowedFileTypes: ['image/*'],
        maxFileSize: 2097152, //TODO: make 8mb //this is 2MB //LATER: make this clearer to read in the future
      },
    });

    this.uppy.use(FileInput, {
      target: '#upload-images',
    });

    this.uppy.on('file-added', (file) => {
      // this.fileToUpload = file;
      // this.getUploadSignature(file);
      console.log('Added file', file);
      this.uploadFile(file);
    });

    this.uppy.on('error', (err) => {
      alert(err);
    });

    this.uppy.on('restriction-failed', (file, error) => {
      //LATER: prettier solution
      alert(error);
    });
  }

  async uploadFile(file: Uppy.UppyFile) {
    try {
      const compressedImage: any = await this.compressImage(file.data);

      console.log('compressed image size ' + compressedImage.size);
      console.log('real size, ' + file.size);

      const customKey = `${nanoid()}_${file.name}`;
      const signature = await this.getUploadSas(customKey);

      const blobServiceClient = new Azure.BlobServiceClient(
        `https://${environment.azure.accountName}.blob.core.windows.net?${signature}`
      );

      const containerClient = blobServiceClient.getContainerClient(
        'item-images'
      );

      const blockBlobClient = containerClient.getBlockBlobClient(customKey);
      console.log(blockBlobClient);

      await blockBlobClient.upload(compressedImage, compressedImage.size, {
        onProgress: (progressEvent) => {
          const progressCounter = Math.round(
            (progressEvent.loadedBytes / compressedImage.size) * 100
          );

          if (progressCounter == 100) {
            //sometimes the upload hangs in the end. so don't show 100%
            //LATER: add progress bar; this.uploadProgress = 99 + '%';

            console.log('99' + '%');
          } else {
            //LATER: add progress bar; this.uploadProgress = progressCounter + '%';
            console.log(progressCounter + '%');
          }
        },

        blobHTTPHeaders: {
          blobContentType: compressedImage.type,
        },
      });

      //TODO: save response to firebase

      console.log('finished uploading to azure');
    } catch (error) {
      //LATER: prettier solutio
      alert(error);
      console.log(error);
    }
  }

  async compressImage(file: File | Blob) {
    const result = await new Promise((resolve, reject) => {
      new Compressor.default(file, {
        quality: 0.5,
        success: resolve,
        error: reject,
      });
    });

    //LATER: hard test these compressions more, i don't think this compresses every image

    return result;
  }

  //Azure blob access token
  async getUploadSas(key: string) {
    const uploadSignature = firebase.default
      .functions()
      .httpsCallable('uploadSignature');

    try {
      let secureSignature = await uploadSignature({
        key: key, //blob name //TODO: dynamic
      });

      console.log(secureSignature.data);
      console.log('got access token');

      return secureSignature.data;
    } catch (error) {
      console.log(error);
    }
  }

  getItem(itemID: string) {
    //TODO: get from db

    this.auth.onAuthStateChanged(async (user) => {
      if (user) {
        this.itemSub = this.db
          .collection('users')
          .doc(user.uid)
          .collection<Item>('items')
          .doc(itemID)
          .valueChanges()
          .subscribe((data) => {
            console.log(data);

            this.patchItemForm(data);
          });
      }
    });

    console.log(itemID + ' is the item id');
  }

  saveItem() {
    //TODO: save firebase items
  }
  //TODO: truncate white spaces

  //save btn pressed //TODO
  onSubmit() {
    //TODO: save item func
  }

  ngOnDestroy() {
    if (this.itemSub) {
      this.itemSub.unsubscribe();
    }

    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }
}
