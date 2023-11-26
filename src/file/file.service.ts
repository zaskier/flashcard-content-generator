import {Injectable} from '@nestjs/common';
import * as fs from 'fs';
import * as csvParser from 'csv-parser';
import {CsvRow} from 'src/utils/intefaces';
import {Storage} from '@google-cloud/storage';
import OpenAI from 'openai';

import {FlashCard} from 'src/flash-cards/entities/flash-card.entity';
import {FirestoreService} from 'src/db/firestore.service';

require('dotenv').config();
const projectId = process.env.PROJECT_ID;
const storage = new Storage({projectId});
const reportFileName: string = `report.csv`;

@Injectable()
export class FileService {
  constructor(private firestore: FirestoreService) {}

  async upload(file: Express.Multer.File): Promise<string> {
    const date: Date = new Date();
    const gsFileName: string = `${date.getTime()}${file.originalname}.csv`;

    const bucket = storage.bucket(process.env.BUCKET_NAME);
    this.generateCards(reportFileName);

    const gsReportFileName: string = `${date.getTime()}${file.originalname}`;

    fs.writeFileSync(reportFileName, file.buffer.toString(), 'utf8');
    await bucket.upload(reportFileName, {
      destination: gsReportFileName,
    });
    fs.unlinkSync(reportFileName);

    return `File ${gsFileName} was added`;
  }

  async remove(blobName: string): Promise<void> {
    const bucket = storage.bucket(process.env.BUCKET_NAME);

    const file = bucket.file(blobName);

    await file.delete();
  }

  async generateCards(filePath: string): Promise<CsvRow[]> {
    return new Promise((resolve, reject) => {
      let data: CsvRow[] = [];
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('headers', headers => {
          // Check if the specified column name exists in the headers
          if (
            headers.includes('subject') === false ||
            headers.includes('topic') === false ||
            headers.includes('text_explanation') === false
          ) {
            fs.writeFileSync(
              reportFileName,
              JSON.stringify({report: 'wrong columns names'})
            );
          }
        })
        .on('data', (row: CsvRow) => {
          const linesArray = row.text_explanation.split('\n');

          linesArray.forEach(element => {
            row.text_explanation = element;
            this.generateCard(row)
              .then(() => {
                row.status = 'sucess';
                data.push({...row});
              })
              .catch(error => {
                row.status = `fail: ${error}`;
                data.push({...row});
                console.error('Promise rejected:', row);
              });
          });
        })
        .on('end', () => {
          resolve(data);
        })
        .on('error', (error: Error) => {
          reject(error);
        });
    });
  }

  async generateCard(row: CsvRow): Promise<FlashCard> {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const text_explanation: string = row.text_explanation;

    const flashcard_data_structure: string = `{"Q": "question","A": "answer"}
  `;

    const prompt = `You are a professional teacher in ${row.subject}.
      Your goal is to generate a flashcard for the subject above with the focus on the ${row.topic} so that a student can improve their understanding of ${row.subject} and ${row.topic} while using that Flashcard.
      Both front and back side of the flashcard must contain a maximum of 2 words and be very concise.
      The result of your work must be a Flaschard in the form of JSON using the ${flashcard_data_structure} data structure.
      Use ${text_explanation} as a helpful input for ideation.
    `;

    const response = await openai.completions.create({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 2048,
    });

    let flashcard: FlashCard = {
      subject: row.subject,
      topic: row.topic,
      flashCards: response.choices[0].text,
    };
    //if card exist don't add it
    const existingCard = this.firestore.get(
      row.subject,
      row.topic,
      response.choices[0].text
    );
    if (existingCard) {
      console.warn('A card with the same values already exists.');
      return;
    } else {
      this.firestore.create(
        process.env.BUCKET_NAME,
        this.firestore.createId(),
        flashcard
      );
    }

    return flashcard;
  }
}
