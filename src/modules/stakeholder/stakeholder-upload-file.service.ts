import { BadRequestException, Injectable } from '@nestjs/common';
import * as csvParser from 'csv-parser';
import { plainToClass } from 'class-transformer';
import { ValidationError, validateOrReject } from 'class-validator';
import {
  StakeholderDto,
  StakeholderFileDto,
  DepartmentAndPosition,
} from './dto/stakeholder.dto';
import { StakeholderCsvHeaderDto } from './dto/stakeholder-header.dto';

@Injectable()
export class StakeholderUploadFileService {
  constructor() {}

  async processStakeholdersFile(
    file: Express.Multer.File,
  ): Promise<StakeholderFileDto> {
    if (
      !file ||
      !file.buffer ||
      file.mimetype !== 'text/csv' ||
      file.size === 0
    ) {
      throw new BadRequestException('No valid file provided');
    }
    await this.validateHeaderCsvFile(file);
    const stakeholders: StakeholderFileDto = await this.parseCsvFile(file);
    return stakeholders;
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
          const csvHeaderDto = plainToClass(StakeholderCsvHeaderDto, {});
          csvHeaderDto.stakeholderId = csvRecord[0];
          csvHeaderDto.name = csvRecord[1];
          csvHeaderDto.email = csvRecord[2];
          csvHeaderDto.department = csvRecord[3];
          csvHeaderDto.manager = csvRecord[4];
          csvHeaderDto.projectRole = csvRecord[5];
          csvHeaderDto.action = csvRecord[6];

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

  private parseCsvFile(file: Express.Multer.File): Promise<StakeholderFileDto> {
    return new Promise(async (resolve, reject) => {
      const stakeholerFile: StakeholderFileDto = {
        file: file.originalname,
        stakeholderIds: [],
        emails: [],
        items: [],
        hasErrors: false,
      };
      let row = 1;
      const stream = csvParser({ headers: false, skipLines: 1 }).on(
        'data',
        (csvRecord) => {
          const departments = this.splitDepartments(csvRecord[3]);
          const item = plainToClass(StakeholderDto, {
            row,
            stakeholderId: csvRecord[0] !== 'null' ? csvRecord[0] : null,
            name: csvRecord[1],
            email: csvRecord[2],
            departmentsAndPositions: departments,
            manager: csvRecord[4],
            projectRole: csvRecord[5],
            action: csvRecord[6] || '',
            errors: [],
          });
          if (item.stakeholderId) {
            stakeholerFile.stakeholderIds.push(item.stakeholderId);
          }
          stakeholerFile.emails.push(item.email);
          stakeholerFile.items.push(item);
          row++;
        },
      );
      stream.write(file.buffer);
      stream.end();
      stream.on('end', () => {
        if (stakeholerFile.items.length === 0) {
          reject(new BadRequestException('Empty file'));
        }
        resolve(stakeholerFile);
      });
    });
  }
  splitDepartments(input: string): DepartmentAndPosition[] {
    if (input === '') return [];
    const departments: { department: string; positions: string[] }[] = [];

    const departmentStrings = input.split('|');

    for (const departmentString of departmentStrings) {
      const [department, positionsString] = departmentString.split(':');
      const positions = positionsString.split('-');
      departments.push({ department, positions });
    }
    return departments;
  }
}
