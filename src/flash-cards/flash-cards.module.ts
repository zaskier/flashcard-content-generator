import {Module} from '@nestjs/common';
import {FlashCardsService} from './flash-cards.service';
import {FlashCardsController} from './flash-cards.controller';
import {FirestoreModule} from 'src/db/firestore.module';

@Module({
  imports: [FirestoreModule],

  controllers: [FlashCardsController],
  providers: [FlashCardsService],
})
export class FlashCardsModule {}
