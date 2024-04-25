import { BadRequestException, Injectable } from '@nestjs/common';
import * as csvParser from 'csv-parser';
import { plainToClass } from 'class-transformer';
import { ValidationError, validateOrReject } from 'class-validator';
import { DepartmentCsvHeaderDto } from './dto/department-header.dto';
import { DepartmentDto, DepartmentFileDto } from './dto/department.dto';

@Injectable()
export class DepartmentUploadFileService {
  constructor() {}

  async processDepartmentsFile(
    file: Express.Multer.File,
  ): Promise<DepartmentFileDto> {
    if (
      !file ||
      !file.buffer ||
      file.mimetype !== 'text/csv' ||
      file.size === 0
    ) {
      throw new BadRequestException('No valid file provided');
    }
    await this.validateHeaderCsvFile(file);
    const departments: DepartmentFileDto = await this.parseCsvFile(file);
    return departments;
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
          const csvHeaderDto = plainToClass(DepartmentCsvHeaderDto, {});
          csvHeaderDto.code = csvRecord[0];
          csvHeaderDto.name = csvRecord[1];
          csvHeaderDto.parent = csvRecord[2];
          csvHeaderDto.manager = csvRecord[3];
          csvHeaderDto.action = csvRecord[4];

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

  private parseCsvFile(file: Express.Multer.File): Promise<DepartmentFileDto> {
    return new Promise(async (resolve, reject) => {
      const departmentFile: DepartmentFileDto = {
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
          const departmentItem = plainToClass(DepartmentDto, {
            row,
            code: csvRecord[0],
            name: csvRecord[1] || '',
            parent: csvRecord[2] === '' ? null : csvRecord[2],
            manager: csvRecord[3] || '',
            action: csvRecord[4] || '',
            errors: [],
          });
          departmentFile.codes.push(departmentItem.code);
          departmentFile.names.push(departmentItem.name);
          departmentFile.items.push(departmentItem);
          row++;
        },
      );
      stream.write(file.buffer);
      stream.end();
      stream.on('end', () => {
        if (departmentFile.items.length === 0) {
          reject(new BadRequestException('Empty file'));
        }
        resolve(departmentFile);
      });
    });
  }
}
