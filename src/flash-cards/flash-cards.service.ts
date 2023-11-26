import {Injectable} from '@nestjs/common';
import {FirestoreService} from 'src/db/firestore.service';
import {FlashCard} from './entities/flash-card.entity';

@Injectable()
export class FlashCardsService {
  constructor(private firestore: FirestoreService) {}

  create(createFlashCard: FlashCard) {
    return this.firestore.create(
      process.env.BUCKET_NAME,
      this.firestore.createId(),
      createFlashCard
    );
  }

  findAll(subject?: string, topic?: string, flashCards?: string) {
    return this.firestore.get(subject, topic, flashCards);
  }

  findOne(id: string) {
    return this.firestore.getById(id);
  }

  remove(id: string) {
    return this.firestore.delete(id);
  }
}
