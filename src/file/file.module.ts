import {Module} from '@nestjs/common';
import {FileService} from './file.service';
import {FileController} from './file.controller';
import {FirestoreModule} from 'src/db/firestore.module';

@Module({
  imports: [FirestoreModule],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
