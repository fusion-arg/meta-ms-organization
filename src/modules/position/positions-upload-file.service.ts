import { BadRequestException, Injectable } from '@nestjs/common';
import * as csvParser from 'csv-parser';
import { plainToClass } from 'class-transformer';
import { ValidationError, validateOrReject } from 'class-validator';
import { PositionDtoCsvHeaderDto } from './dto/position-header.dto';
import { PositionDto, PositionFileDto } from './dto/position.dto';

@Injectable()
export class PositionUploadFileService {
  constructor() {}

  async processPositionsFile(
    file: Express.Multer.File,
  ): Promise<PositionFileDto> {
    if (
      !file ||
      !file.buffer ||
      file.mimetype !== 'text/csv' ||
      file.size === 0
    ) {
      throw new BadRequestException('No valid file provided');
    }
    await this.validateHeaderCsvFile(file);
    const positions: PositionFileDto = await this.parseCsvFile(file);
    return positions;
  }

  private async validateHeaderCsvFile(
    file: Express.Multer.File,
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const stream = csvParser({ headers: false });

      let csvRecord: string[] | undefined;

      stream.on('data', async (record) => {
        csvRecord = record;
        stream.pause();
      });

      stream.on('pause', async () => {
        try {
          const csvHeaderDto = plainToClass(PositionDtoCsvHeaderDto, {});
          csvHeaderDto.name = csvRecord[0];
          csvHeaderDto.code = csvRecord[1];
          csvHeaderDto.action = csvRecord[2];

          await validateOrReject(csvHeaderDto);
          resolve();
        } catch (validationErrors) {
          const errorMessages = validationErrors.map(
            (error: ValidationError) => {
              return Object.values(error.constraints).join(', ');
            },
          );

          reject(
            new BadRequestException(
              `The file header does not match the expected fields. Details: ${errorMessages}`,
            ),
          );
        }
      });
      stream.write(file.buffer);
      stream.end();
    });
  }

  private parseCsvFile(file: Express.Multer.File): Promise<PositionFileDto> {
    return new Promise(async (resolve, reject) => {
      const positionFile: PositionFileDto = {
        file: file.originalname,
        codes: [],
        names: [],
        items: [],
        hasErrors: false,
      };
      let row = 1;
      const stream = csvParser({ headers: false, skipLines: 1 }).on(
        'data',
        (csvRecord) => {
          const positionItem = plainToClass(PositionDto, {
            row,
            name: csvRecord[0] || '',
            code: csvRecord[1],
            action: csvRecord[2] || '',
            errors: [],
          });
          positionFile.codes.push(positionItem.code);
          positionFile.names.push(positionItem.name);
          positionFile.items.push(positionItem);
          row++;
        },
      );
      stream.write(file.buffer);
      stream.end();
      stream.on('end', () => {
        if (positionFile.items.length === 0) {
          reject(new BadRequestException('Empty file'));
        }
        resolve(positionFile);
      });
    });
  }
}
