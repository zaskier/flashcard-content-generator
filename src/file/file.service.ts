import {Injectable} from '@nestjs/common';

import * as fs from 'fs';
import * as csvParser from 'csv-parser';
import {CsvRow} from 'src/utils/intefaces';
import {Storage} from '@google-cloud/storage';

require('dotenv').config();
const projectId = process.env.PROJECT_ID;
const storage = new Storage({projectId});

@Injectable()
export class FileService {
  private readonly bucketName = 'card-content'; // Replace with your GCS bucket name

  async upload(file: Express.Multer.File): Promise<string> {
    const date = new Date();
    const bucket = storage.bucket(process.env.BUCKET_NAME);
    fs.writeFileSync('last.csv', file.buffer.toString(), 'utf8');
    await bucket.upload('last.csv', {
      destination: `${date.getTime()}${file.originalname}.csv`,
    });
    return `File ${date.getTime()}${file.originalname}.csv was added`;
  }

  async remove(blobName: string): Promise<void> {
    const bucket = storage.bucket(process.env.BUCKET_NAME);

    const file = bucket.file(blobName);

    await file.delete();
  }

  async readCsvFile(filePath: string): Promise<CsvRow[]> {
    return new Promise((resolve, reject) => {
      const data: CsvRow[] = [];

      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row: CsvRow) => {
          // Process each row of the CSV file
          data.push(row);
        })
        .on('end', () => {
          // All rows have been received
          resolve(data);
        })
        .on('error', (error: Error) => {
          reject(error);
        });
    });
  }
}
