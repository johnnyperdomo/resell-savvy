import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';
import * as azure from '@azure/storage-blob';
import { nanoid } from 'nanoid';
import * as mime from 'mime-types';

const db = admin.firestore();

const config = functions.config();
const azure_blob_connection_string =
  config.azure.blob_storage.connection_string;

const app = express();
app.use(cors({ origin: true })); //cors => any other url can access this api

//get the authenticated user
const authenticate = async (tokenId: string) => {
  return admin
    .auth()
    .verifyIdToken(tokenId)
    .then((decoded) => {
      return decoded;
    })
    .catch((err) => {
      console.error(err);
      throw new functions.https.HttpsError(
        'unauthenticated',
        'You are not authorized to make this request.'
      );
    });
};

const runtimeOpts: functions.RuntimeOptions = {
  memory: '256MB',
  timeoutSeconds: 180,
}; //timeout in 3 minutes, since we're uploading images, this can cause the function to last longer

//API =========>

//{api-url}/item/create
app.post('/create', async (req: express.Request, res: express.Response) => {
  //if no firebase token present, return error
  if (!req.headers.authorization) {
    res
      .status(403)
      .json({ error: 'You must be logged in to make this request.' });

    throw Error('You must be logged in to make this request.');
  }

  const tokenId = req.headers.authorization.split('Bearer ')[1];

  try {
    const authenticated = await authenticate(tokenId);

    //1. Create New Firestore Document
    const firestoreDocID = await createNewItemInFirestore(
      authenticated.uid,
      req.body.properties,
      req.body.listing
    );

    //2. Upload Blobs
    const uploadedBlobs = await uploadBlobs(req.body.properties.imageUrls);

    //3. Update firestore doc with new blobs
    const imageValues = await addImageFilesToFirestoreDoc(
      authenticated.uid,
      firestoreDocID,
      uploadedBlobs
    );

    res.status(200).send({
      response: 'successfully created item',
      user: authenticated.uid,
      firestoreDocID: firestoreDocID,
      imageValues: imageValues,
      blobs: uploadedBlobs,
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

//Methods =========>
async function createNewItemInFirestore(
  uid: string,
  properties: any,
  listing: any
) {
  try {
    const itemID = nanoid();

    //properties
    const title = properties.title;
    const description = properties.description;
    const sku = properties.sku;
    const color = properties.color;
    const brand = properties.brand;
    const condition = properties.condition;
    const price = properties.price;

    //listing
    const marketplace = listing.from_marketplace;
    const marketplaces = {
      [`${marketplace}`]: {
        extractedID: listing.id,
        url: listing.url,
      },
    };

    await db.collection('users').doc(uid).collection('items').doc(itemID).set({
      id: itemID,
      title: title,
      searchableIndex: [],
      description: description,
      status: 'active',
      images: [],
      price: price,
      brand: brand,
      condition: condition,
      color: color,
      sku: sku,
      cost: null,
      notes: '',
      marketplaces: marketplaces,
      sold: null,
      profit: null,
      created: admin.firestore.Timestamp.now(),
      modified: admin.firestore.Timestamp.now(),
    });

    return itemID;
  } catch (error) {
    throw new functions.https.HttpsError('unknown', error);
  }
}

async function uploadBlobs(dataUris: string[]) {
  try {
    //loop over uploads
    const uploadOperations = dataUris.map(async (uri) => {
      return await _uploadDataUriToBlobStorage(uri);
    });

    //settle
    const results = await Promise.allSettled(uploadOperations);

    //only retrieve successfully uploaded images
    const successfullyUploadedImages = results
      .filter((res) => res.status === 'fulfilled')
      .map((img: any) => img.value);

    return successfullyUploadedImages;
  } catch (error) {
    throw new functions.https.HttpsError('unknown', error);
  }
}

async function addImageFilesToFirestoreDoc(
  uid: string,
  firestoreDocID: string,
  blobValues: {
    blobID: string;
    blobContainer: string;
    imageName: string;
    imageSize: string;
    fileUrl: string;
    uploadDate: string;
  }[]
) {
  //map into object
  const imageValues = blobValues.map((val) => {
    return {
      blobContainer: val.blobContainer,
      blobID: val.blobID,
      imageName: val.imageName,
      imageSize: val.imageSize,
      uploadDate: val.uploadDate,
    };
  });

  try {
    //upload
    await db
      .collection('users')
      .doc(uid)
      .collection('items')
      .doc(firestoreDocID)
      .update({
        images: admin.firestore.FieldValue.arrayUnion(...imageValues),
        modified: admin.firestore.Timestamp.now(),
      });

    return imageValues;
  } catch (error) {
    throw new functions.https.HttpsError('unknown', error);
  }
}

async function _uploadDataUriToBlobStorage(imageUrl: string) {
  try {
    // create a blob service client
    const blobServiceClient = azure.BlobServiceClient.fromConnectionString(
      azure_blob_connection_string
    );

    //create reference to a container
    const containerName = 'item-images';
    const containerClient = blobServiceClient.getContainerClient(containerName);

    //convert base64 images(data uri), into buffers => upload
    const data = _convertDataUriToBuffer(imageUrl);

    //create blob
    const blobID = data.fileName;

    const blockBlobClient = containerClient.getBlockBlobClient(blobID);

    //upload data to blob; Buffer
    await blockBlobClient.upload(data.buffer, data.buffer.length, {
      blobHTTPHeaders: {
        blobContentType: data.contentType,
      },
    });

    return {
      blobID: blobID,
      blobContainer: containerName,
      imageName: blobID,
      imageSize: data.buffer.length,
      fileUrl: `https://resellsavvydev.blob.core.windows.net/item-images/${blobID}`,
      uploadDate: admin.firestore.Timestamp.now(),
    };
  } catch (error) {
    throw error;
  }
}

function _convertDataUriToBuffer(dataUri: string) {
  //only get base 64 string => Buffer; https://stackoverflow.com/questions/7511321/uploading-base64-encoded-image-to-amazon-s3-via-node-js?rq=1
  const buffer = Buffer.from(
    dataUri.replace(/^data:image\/\w+;base64,/, ''),
    'base64'
  );

  const contentType = dataUri.split(',')[0].split(':')[1].split(';')[0];
  const fileExt = mime.extension(contentType);
  const fileName = nanoid() + '.' + fileExt;

  return {
    buffer: buffer,
    fileName: fileName,
    contentType: contentType,
    fileExt: fileExt,
  };
}

export const item = functions.runWith(runtimeOpts).https.onRequest(app);
