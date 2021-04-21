import * as functions from 'firebase-functions';
import * as Azure from '@azure/storage-blob';

import { ItemImageInterface } from './interface';

//TODO: redo these functions
const config = functions.config();
const azure_blob_storage = config.azure.blob_storage; //config path

const accountName = azure_blob_storage.account_name;
const accountKey = azure_blob_storage.account_key;

const sharedKeyCredential = new Azure.StorageSharedKeyCredential(
  accountName,
  accountKey
);

const blobServiceClient = new Azure.BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  sharedKeyCredential
);

export const deleteAllItemImages = functions.firestore
  .document('/users/{user_id}/items/{item_id}')
  .onDelete(async (snap, context) => {
    const deletedDoc = snap.data();

    const itemImages: ItemImageInterface[] = deletedDoc.images;

    itemImages.map(async (obj) => {
      const containerClient = blobServiceClient.getContainerClient(
        obj.blobContainer
      );
      const blockBlobClient = containerClient.getBlockBlobClient(obj.blobID);

      try {
        await blockBlobClient.delete();
      } catch (error) {
        throw new functions.https.HttpsError('unknown', error);
      }
    });

    return;
  });

export const deleteIndividualItemImages = functions.firestore
  .document('/users/{user_id}/items/{item_id}')
  .onUpdate(async (change, context) => {
    const updatedDoc = change.after.data();

    const oldDoc = change.before.data();

    const oldItemImages: ItemImageInterface[] = oldDoc.images;
    const newItemImages: ItemImageInterface[] = updatedDoc.images;

    //only get deleted images
    const deletedItemImages = oldItemImages.filter((oldPreviewImage) => {
      return !newItemImages.some(
        (newPreviewImage) => newPreviewImage.blobID === oldPreviewImage.blobID
      );
    });

    deletedItemImages.map(async (obj) => {
      const containerClient = blobServiceClient.getContainerClient(
        obj.blobContainer
      );
      const blockBlobClient = containerClient.getBlockBlobClient(obj.blobID);

      try {
        await blockBlobClient.delete();
      } catch (error) {
        throw new functions.https.HttpsError('unknown', error);
      }
    });

    return;
  });
