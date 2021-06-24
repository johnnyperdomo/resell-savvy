import * as functions from 'firebase-functions';
import * as Azure from '@azure/storage-blob';
import { ItemImageInterface } from './interface';

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

    return null;
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

    return null;
  });

//when a document is written to, we update the searchable index based on the item title; allowing us to search through the docs by partial title substrings.
//NOTE: Any time you write to the same document that triggered a function, you are at risk of creating an infinite loop. Use caution and ensure that you safely exit the function when no change is needed. Make sure to exit out of function already written. If data is the same, it won't be updated.
export const writeSearchableTitleIndex = functions.firestore
  .document('/users/{user_id}/items/{item_id}')
  .onWrite(async (change, context) => {
    const prevSnap = change.before;
    const currentSnap = change.after;

    const prevDoc = prevSnap.exists ? prevSnap.data() : null;
    const document = currentSnap.exists ? currentSnap.data() : null;

    if (!document) {
      //if document is null, it means it has been deleted, and we return out of this function
      return null;
    }

    if (document.title === undefined) {
      functions.logger.log('exit out function cuz no title present');
      return null;
    }

    if (prevDoc && document.title === prevDoc.title) {
      functions.logger.log('exit out function cuz title is the same');
      return null;
    }

    try {
      const title = document.title;
      const searchableIndex = _generateSearchableKeys(title);

      const ref = change.after.ref;

      return await ref.update({
        searchableIndex: searchableIndex,
      });
    } catch (error) {
      throw new functions.https.HttpsError('unknown', error);
    }
  });

function _generateSearchableKeys(text: string) {
  const stringOnly = text.replace(/[^a-zA-Z ]/g, '');

  const array = stringOnly.toLowerCase().split('');
  const searchableIndex: string[] = [];

  let prevKey = '';

  for (const char of array) {
    const key = prevKey + char;
    searchableIndex.push(key);
    prevKey = key;
  }

  return searchableIndex;
}
