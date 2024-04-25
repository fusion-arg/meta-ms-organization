import { BadRequestException, Injectable } from '@nestjs/common';
import * as csvParser from 'csv-parser';
import { plainToClass } from 'class-transformer';
import { ValidationError, validateOrReject } from 'class-validator';
import { InfluencerDto, InfluencerItem } from './dto/influencer.dto';
import { InfluencerCsvHeaderDto } from './dto/influencer-header.dto';

@Injectable()
export class InfluencerUploadFileService {
  constructor() {}

  async processFile(file: Express.Multer.File): Promise<InfluencerDto> {
    if (
      !file ||
      !file.buffer ||
      file.mimetype !== 'text/csv' ||
      file.size === 0
    ) {
      throw new BadRequestException('No valid file provided');
    }
    await this.validateHeaderCsvFile(file);
    const influencers: InfluencerDto = await this.parseCsvFile(file);
    return influencers;
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
          const csvHeaderDto = plainToClass(InfluencerCsvHeaderDto, {});
          csvHeaderDto.stakeholderId = csvRecord[0];
          csvHeaderDto.influence = csvRecord[1];
          csvHeaderDto.excluded = csvRecord[2];
          csvHeaderDto.action = csvRecord[3];

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

  private parseCsvFile(file: Express.Multer.File): Promise<InfluencerDto> {
    return new Promise(async (resolve, reject) => {
      const influencerFile: InfluencerDto = {
        file: file.originalname,
        stakeholderIds: [],
        items: [],
        hasErrors: false,
      };
      let row = 1;
      const stream = csvParser({ headers: false, skipLines: 1 }).on(
        'data',
        (csvRecord) => {
          const item = plainToClass(InfluencerItem, {
            row,
            stakeholderCode: csvRecord[0] || '',
            influence: csvRecord[1],
            excluded: csvRecord[2],
            action: csvRecord[3],
            errors: [],
          });
          influencerFile.stakeholderIds.push(item.stakeholderCode);
          influencerFile.items.push(item);
          row++;
        },
      );
      stream.write(file.buffer);
      stream.end();
      stream.on('end', () => {
        if (influencerFile.items.length === 0) {
          reject(new BadRequestException('Empty file'));
        }
        resolve(influencerFile);
      });
    });
  }
}
