import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import {FileService} from './file.service';
import {FileInterceptor} from '@nestjs/platform-express';
import * as fs from 'fs';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({maxSize: 100000}),
          new FileTypeValidator({fileType: 'csv'}),
        ],
      })
    )
    file: Express.Multer.File
  ): Promise<string> {
    return await this.fileService.upload(file);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<any> {
    return this.fileService.remove(id);
  }
}
