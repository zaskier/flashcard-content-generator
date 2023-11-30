import {Injectable} from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import {ConfigService} from 'src/config/config.service';

@Injectable()
export class FirestoreService {
  db: FirebaseFirestore.Firestore = null;

  constructor(private config: ConfigService) {
    const firebaseConfig = {
      projectId: process.env.PROJECT_ID,
      databaseURL: process.env.FIRESTORE_URL,
    };
    admin.initializeApp({
      ...firebaseConfig,
      credential: admin.credential.applicationDefault(),
    });
    this.db = admin.firestore();
  }
  public createId() {
    return this.db.collection('_').doc().id;
  }
  public async create(
    colleciton: string,
    id: string,
    payload: any
  ): Promise<any> {
    const docRef = this.db.collection(colleciton).doc(id);
    return docRef.set(payload);
  }

  public async get(
    subject?: string,
    topic?: string,
    flashCards?: string
  ): Promise<any> {
    let query: any = this.db.collection(process.env.BUCKET_NAME);

    //filtering
    if (subject !== undefined) {
      query = query.where('subject', '==', subject);
    }

    if (topic !== undefined) {
      query = query.where('topic', '==', topic);
    }

    if (flashCards !== undefined) {
      query = query.where('flashCards', '==', flashCards);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
  }

  public async getById(id: string): Promise<any> {
    const doc = await this.db.collection(process.env.BUCKET_NAME).doc(id).get();
    return doc.exists ? {id: doc.id, ...doc.data()} : null;
  }

  public async delete(id: string): Promise<any> {
    await this.db.collection(process.env.BUCKET_NAME).doc(id).delete();
  }
}
