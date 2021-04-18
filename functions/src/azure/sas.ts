import * as Azure from '@azure/storage-blob';
import * as functions from 'firebase-functions';
import { HttpsError } from 'firebase-functions/lib/providers/https';

const config = functions.config(); //TODO
const azure_blob_storage = config.azure.blob_storage; //config path //TODO

//SAS signature for access to Azure Blobs
export const uploadSignature = functions.https.onCall((data, context) => {
  if (!context.auth || !context.auth.uid) {
    throw new HttpsError(
      'unauthenticated',
      'You are not authorized to make this request.'
    );
  }
  const accountName = azure_blob_storage.account_name; //TODO: make this dynamic and add to config //prod or dev
  const accountKey = azure_blob_storage.account_key; //TODO: make this dynamic, different account keys for prod and development
  const sharedCredential = new Azure.StorageSharedKeyCredential(
    accountName,
    accountKey
  );

  const startDate = new Date();
  const expiryDate = new Date(startDate);
  expiryDate.setMinutes(startDate.getMinutes() + 60); //expired in one hour
  startDate.setMinutes(startDate.getMinutes() - 60); //take timezone changes into consideration

  const SAS = Azure.generateBlobSASQueryParameters(
    {
      blobName: data.key,
      containerName: 'item-images', //course-files, or course-
      permissions: Azure.BlobSASPermissions.parse('c'), //used to only create new blobs
      startsOn: startDate,
      expiresOn: expiryDate,
    },
    sharedCredential
  );

  return SAS.toString();
});
