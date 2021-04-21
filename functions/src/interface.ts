import * as admin from 'firebase-admin';

export interface ItemImageInterface {
  uploadDate: admin.firestore.Timestamp;
  blobID: string; //unique id of blob in Azure
  blobContainer: string; //container of blob; should be 'course-images'
  imageName: string;
  imageSize: number; //in bytes //6mb file size
}
