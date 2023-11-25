import {Injectable} from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import {ConfigService} from 'src/config/config.service';

@Injectable()
export class FirestoreService {
  db: FirebaseFirestore.Firestore = null;
  constructor(private config: ConfigService) {
    if (config.isDevelopment()) {
      let pathToKeyFile = config.get('FIRESTORE_KEY_FILE');
      let serviceAccount = JSON.parse(
        fs.readFileSync(pathToKeyFile).toString()
      );

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }
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
    let docRef = this.db.collection(colleciton).doc(id);
    return docRef.set(payload);
  }

  public async get(subject?: string, topic?: string): Promise<any> {
    let query: any = this.db.collection('flash_cards');

    //filtering
    if (subject !== undefined) {
      query = query.where('subject', '==', subject);
    }

    if (topic !== undefined) {
      query = query.where('topic', '==', topic);
    }
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
  }

  public async getById(id: string): Promise<any> {
    const doc = await this.db.collection('flash_cards').doc(id).get();
    return doc.exists ? {id: doc.id, ...doc.data()} : null;
  }

  public async delete(id: string): Promise<any> {
    await this.db.collection('flash_cards').doc(id).delete();
  }
}
