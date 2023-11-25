import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {FlashCardsModule} from './flash-cards/flash-cards.module';
import {FileModule} from './file/file.module';
import {FirestoreModule} from './db/firestore.module';
import {ConfigModule} from './config/config.module';

@Module({
  imports: [FlashCardsModule, FileModule, FirestoreModule, ConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
