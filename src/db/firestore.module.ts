import {Module} from '@nestjs/common';
import {FirestoreService} from './firestore.service';
import {ConfigModule} from 'src/config/config.module';

@Module({
  imports: [ConfigModule],
  providers: [FirestoreService],
  exports: [FirestoreService],
})
export class FirestoreModule {}
