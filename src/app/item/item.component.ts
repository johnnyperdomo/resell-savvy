import { Component, OnInit } from '@angular/core';
import * as Azure from '@azure/storage-blob';
import * as firebase from 'firebase';
import * as Uppy from '@uppy/core';
import { nanoid } from 'nanoid';
import * as FileInput from '@uppy/file-input';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
})

//LATER: have a more sophisticated file upload system, maybe uusing filepond library with image previews? idk
export class ItemComponent implements OnInit {
  //TODO: change status here; if they have no active listing urls, automatically mark as draft.
  //dont mark as draft even if they dfont have a listing url, only on the situation where iit is marked as 'sold', since sold will have its own sell location. ({sold, {marketplace: 'poshmark'}})

  //TODO: if an item is clicked to be listed, then automatically save the item before opening chrome extension

  uppy: Uppy.Uppy<Uppy.TypeChecking>;

  constructor() {}

  ngOnInit(): void {
    this.initializeFileUploader();
  }

  initializeFileUploader() {
    //TODO: if user has 16 images, disable button
    this.uppy = Uppy({
      autoProceed: false,
      restrictions: {
        allowedFileTypes: ['image/*'],
        maxFileSize: 2097152, //this is 2MB //LATER: make this clearer to read in the future //LATER: allow users to upload 4MB size, if we have image optimization installed anyways. to allow them creative freedom. compress images something like (tiny png)
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
      // TODO: compress image
    });
  }

  async uploadFile(file: Uppy.UppyFile) {
    try {
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

      await blockBlobClient.upload(file.data, file.data.size, {
        onProgress: (progressEvent) => {
          const progressCounter = Math.round(
            (progressEvent.loadedBytes / file.data.size) * 100
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
          blobContentType: file.data.type,
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
  } //TODO
}
