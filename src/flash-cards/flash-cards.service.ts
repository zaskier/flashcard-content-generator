import {Injectable} from '@nestjs/common';
import OpenAI from 'openai';
import {FirestoreService} from 'src/db/firestore.service';
import {FlashCard} from './entities/flash-card.entity';

@Injectable()
export class FlashCardsService {
  constructor(private firestore: FirestoreService) {}

  create(createFlashCard: FlashCard) {
    return this.firestore.create(
      'flash_cards',
      this.firestore.createId(),
      createFlashCard
    );
  }

  findAll(subject?: string, topic?: string) {
    return this.firestore.get(subject, topic);
  }

  generateCard() {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const subject: string = 'biology';
    const topic: string = 'Population ecology';

    const flashcard_data_structure: string = `{
      "Q": "question",
      "A": "answer"
  }
  `;

    const text_explanation: string =
      'Gradation is the mass increase of populations at regular or irregular time intervals';

    const runPrompt = async () => {
      const prompt = `
      You are a professional teacher in ${subject}.
      Your goal is to generate a flashcard for the subject above with the focus on the ${topic} so that a student can improve their understanding of ${subject} and ${topic} while using that Flashcard.
      Both front and back side of the flashcard must contain a maximum of 2 words and be very concise.
      The result of your work must be a Flaschard in the form of JSON using the ${flashcard_data_structure} data structure.
      Use ${text_explanation} as a helpful input for ideation.
    `;

      const response = await openai.completions.create({
        model: 'text-davinci-003',
        prompt: prompt,
        max_tokens: 2048,
      });

      return response.choices[0].text;
    };

    runPrompt();
  }

  findOne(id: string) {
    return this.firestore.getById(id);
  }

  remove(id: string) {
    return this.firestore.delete(id);
  }
}
