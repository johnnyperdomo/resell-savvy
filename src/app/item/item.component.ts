import { Component, OnInit } from '@angular/core';
import * as Azure from '@azure/storage-blob';
import * as firebase from 'firebase';
import * as Uppy from '@uppy/core';
import { nanoid } from 'nanoid';
import * as FileInput from '@uppy/file-input';
import { environment } from 'src/environments/environment';
import * as Compressor from 'compressorjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Item } from '../shared/models/item.model';
import { Subscription } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
})

//LATER: have a more sophisticated file upload system, maybe uusing filepond library with image previews? idk
//LATER: if user clicks cancel button is about to leave page, have a prompt that says, are you sure want to leave without saving, to make sure they don't lose their progress?
//LATER: see how you can download images with cdn path, to reduce bandwidth
//LATER: load html after data input, since the transition looks kind of ugly (bad ux)
export class ItemComponent implements OnInit {
  itemForm: FormGroup;

  item: Item;
  itemSub: Subscription;

  routeSub: Subscription;

  storagePath: string = environment.azure.storagePath; //azure storage url for hosted images

  uppy: Uppy.Uppy<Uppy.TypeChecking>;

  isUploading: boolean = false; //image upload state

  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private route: ActivatedRoute,
    private router: Router,
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
      color: [''],
      sku: [''],
      cost: [null],
      notes: [''],
      ebay: [''],
      poshmark: [''],
      mercari: [''],
      etsy: [''],
      grailed: [''],
      depop: [''],
      kidizen: [''],
      // tradesy: [''],
      // facebook: [''],
    });
  }

  patchItemForm(item: Item) {
    this.itemForm.patchValue({
      title: item.title,
      description: item.description,
      price: item.price,
      brand: item.brand,
      condition: item.condition,
      color: item.color,
      sku: item.sku,
      cost: item.cost,
      notes: item.notes,
      ebay: item.marketplaces.ebay,
      poshmark: item.marketplaces.poshmark,
      mercari: item.marketplaces.mercari,
      etsy: item.marketplaces.etsy,
      grailed: item.marketplaces.grailed,
      depop: item.marketplaces.depop,
      kidizen: item.marketplaces.kidizen,
      // facebook: item.marketplaces.facebook,
      // tradesy: item.marketplaces.tradesy,
    });
  }

  initializeFileUploader() {
    //TODO: if user has 16 images, disable button
    this.uppy = Uppy({
      autoProceed: false,
      restrictions: {
        allowedFileTypes: ['image/*'],
        maxFileSize: 6291456, //6mb
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
      this.isUploading = true;

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

      this.auth.onAuthStateChanged(async (user) => {
        if (user) {
          try {
            await this.db.firestore
              .collection('users')
              .doc(user.uid)
              .collection('items')
              .doc(this.item.id)
              .update({
                images: firebase.default.firestore.FieldValue.arrayUnion({
                  uploadDate: firebase.default.firestore.Timestamp.now(),
                  blobID: customKey,
                  blobContainer: environment.azure.itemImages,
                  imageName: file.name,
                  imageSize: file.size,
                }),
              });

            this.isUploading = false;

            console.log('complete');
          } catch (error) {
            this.isUploading = false;
            alert(error.message);
          }
        }
      });
    } catch (error) {
      //LATER: prettier solutio
      this.isUploading = false;

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
        key: key, //blob name
      });

      return secureSignature.data;
    } catch (error) {
      console.log(error);
    }
  }

  getItem(itemID: string) {
    this.auth.onAuthStateChanged(async (user) => {
      if (user) {
        this.itemSub = this.db
          .collection('users')
          .doc(user.uid)
          .collection<Item>('items')
          .doc(itemID)
          .valueChanges()
          .subscribe((data) => {
            this.item = data;

            this.patchItemForm(data);
          });
      }
    });
  }

  onDeleteImage(imageImage: any) {
    console.log('delete');

    //LATER: add confirmation if they want to delete image
    this.auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          await this.db.firestore
            .collection('users')
            .doc(user.uid)
            .collection('items')
            .doc(this.item.id)
            .update({
              images: firebase.default.firestore.FieldValue.arrayRemove(
                imageImage
              ),
            });
        } catch (error) {
          this.isUploading = false;
          alert(error.message);
        }
      }
    });
  }

  saveItem() {
    console.log('save');

    const formValue = this.itemForm.value;

    const title = this.trimStr(formValue.title);
    const description = this.trimStr(formValue.description);
    const price = formValue.price;
    const brand = this.trimStr(formValue.brand);
    const condition = this.trimStr(formValue.condition);
    const color = this.trimStr(formValue.color);
    const sku = this.trimStr(formValue.sku);
    const cost = formValue.cost;
    const notes = this.trimStr(formValue.notes);
    const ebay = this.trimStr(formValue.ebay);
    const poshmark = this.trimStr(formValue.poshmark);
    const mercari = this.trimStr(formValue.mercari);
    // const facebook = this.trimStr(formValue.facebook); //LATER
    const etsy = this.trimStr(formValue.etsy);
    // const tradesy = this.trimStr(formValue.tradesy); //LATER
    const grailed = this.trimStr(formValue.grailed);
    const depop = this.trimStr(formValue.depop);
    const kidizen = this.trimStr(formValue.kidizen);

    const status = this.setItemStatus([
      ebay,
      poshmark,
      mercari,
      // facebook,
      etsy,
      grailed,
      depop,
      kidizen,
      // tradesy,
    ]);

    this.auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          await this.db.firestore
            .collection('users')
            .doc(user.uid)
            .collection('items')
            .doc(this.item.id)
            .update({
              title: title,
              description: description,
              status: status,
              price: price,
              brand: brand,
              condition: condition,
              color: color,
              sku: sku,
              cost: cost,
              notes: notes,
              marketplaces: {
                ebay: ebay,
                poshmark: poshmark,
                mercari: mercari,
                facebook: '', //LATER: integrate with facebook, a little challenging
                etsy: etsy,
                grailed: grailed,
                depop: depop,
                kidizen: kidizen,
                tradesy: '', //LATER: integrate with tradesy
              },
              modified: firebase.default.firestore.Timestamp.now(),
            });
        } catch (error) {
          alert(error);
        }
      }
    });
  }

  onSubmit() {
    this.saveItem();
    this.router.navigate(['/inventory']);
  }

  //trim string value
  trimStr(str: string) {
    return str.trim();
  }

  goToLink(link: string) {
    const externalURL = link.match(/^http[s]?:\/\//) ? link : 'http://' + link;

    window.open(externalURL, '_blank');
  }

  onListItem() {
    //TODO: chrome extension should list this item
    //TODO: disable if no chrome extension present
    console.log('list item');

    this.saveItem();
  }

  onListItems() {
    //TODO: chrome extension should list this item
    //TODO: disable if no chrome extension present

    //Ope modal

    console.log('list item');
    this.saveItem();
  }

  onDelistItem() {
    console.log('delist item');

    this.saveItem();
    //TODO: chrome extension should list this item
    //TODO: disable if no chrome extension present
  }

  //based if they have a listing url or not
  setItemStatus(marketplaceValues: string[]) {
    const urls = marketplaceValues.filter((listingURLS) => {
      return listingURLS != '';
    });

    if (urls.length > 0) {
      return 'active';
    }

    return 'draft';
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
