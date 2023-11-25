import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {FlashCardsService} from './flash-cards.service';

import {FlashCard} from './entities/flash-card.entity';

@Controller('flash-cards')
export class FlashCardsController {
  constructor(private readonly flashCardsService: FlashCardsService) {}

  @Post()
  create(@Body() createFlashCard: FlashCard) {
    return this.flashCardsService.create(createFlashCard);
  }

  @Get()
  findAll(@Query('subject') subject?: string) {
    return this.flashCardsService.findAll(subject);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.flashCardsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.flashCardsService.remove(id);
  }
}
