import { Injectable } from '@nestjs/common';
import { UploadFileAction } from '../../enum/upload-file.enum';
import { CountMap, FileDto, FileItem } from './dto/file.dto';
import {
  StakeholderDto,
  StakeholderFileDto,
} from '../stakeholder/dto/stakeholder.dto';
import { isNumber, isValidEmail } from '../../utils/validate';

@Injectable()
export class ValidateFileService {
  constructor() {}

  async validateStakeholderFile(fileDto: StakeholderFileDto): Promise<void> {
    const countStakeholders = this.getCountMap(fileDto.stakeholderIds);
    const countEmails = this.getCountMap(fileDto.emails);

    for (const item of fileDto.items) {
      await this.validateAction(item.action, item.errors);
      await this.validateLengthName(item.name, item.errors);
      await this.validateManager(item);
      await this.validateEmail(item, countEmails);
      await this.validateIds(item, countStakeholders);
      await this.validateDeparmentAndPositions(item);
    }
    if (fileDto.items.some((item) => item.errors.length > 0)) {
      fileDto.hasErrors = true;
    }
  }

  async validateFile(fileDto: FileDto): Promise<void> {
    const countNames = this.getCountMap(fileDto.names);
    const countCodes = this.getCountMap(fileDto.codes);

    for (const item of fileDto.items) {
      await this.validateItems(item, countNames, countCodes);
    }
    if (fileDto.items.some((item) => item.errors.length > 0)) {
      fileDto.hasErrors = true;
    }
  }

  getCountMap(arr: string[]): CountMap {
    return arr.reduce((countMap: CountMap, item) => {
      countMap[item] = (countMap[item] || 0) + 1;
      return countMap;
    }, {});
  }

  private async validateItems(
    item: FileItem,
    countNames: CountMap,
    countCodes: CountMap,
  ) {
    await this.validateAction(item.action, item.errors);
    await this.validateName(item, countNames);
    await this.validateCode(item, countCodes);
  }

  private async validateEmail(item: StakeholderDto, countEmails: CountMap) {
    if (countEmails[item.email] > 1) {
      item.errors.push(`Invalid column 'email', duplicated in this file.`);
    }
    if (!isValidEmail(item.email)) {
      item.errors.push(`Invalid column 'email'.`);
    }
  }

  private async validateIds(item: StakeholderDto, countIds: CountMap) {
    if (countIds[item.stakeholderId] > 1) {
      item.errors.push(
        `Invalid column 'stakeholderId', duplicated in this file.`,
      );
    }
    if (item.action !== UploadFileAction.add) {
      await this.validateItemNumber(
        item.stakeholderId,
        item.errors,
        'stakeholderId',
      );
    }
  }
  private async validateDeparmentAndPositions(item: StakeholderDto) {
    const departmentsSet = new Set();

    for (const departmentAndPosition of item.departmentsAndPositions) {
      if (!isNumber(departmentAndPosition.department)) {
        item.errors.push(`Invalid Department, must be numeric.`);
      }
      if (departmentsSet.has(departmentAndPosition.department)) {
        item.errors.push(`Invalid Department, already exist.`);
      } else {
        departmentsSet.add(departmentAndPosition.department);
      }
      const positionsSet = new Set();
      for (const position of departmentAndPosition.positions) {
        if (!isNumber(position)) {
          item.errors.push(
            `Invalid Position in department ${departmentAndPosition.department}, must be numeric.`,
          );
        }
        if (positionsSet.has(position)) {
          item.errors.push(`Invalid Department, position already exist.`);
        } else {
          positionsSet.add(position);
        }
      }
    }
  }

  private async validateName(item: FileItem, countNames: CountMap) {
    if (countNames[item.name] > 1) {
      item.errors.push(`Invalid column 'name', duplicated in this file.`);
    }
    await this.validateLengthName(item.name, item.errors);
  }
  private async validateLengthName(field: string, errors: string[]) {
    if (field.length < 3) {
      errors.push(`Invalid column 'name', must be longer than 3 characters.`);
    }
  }

  private async validateItemNumber(
    field: string,
    errors: string[],
    columnName: string,
  ) {
    if (!isNumber(field)) {
      errors.push(`Invalid column ${columnName}, must be numeric.`);
    }
  }

  private async validateCode(item: FileItem, countCodes: CountMap) {
    if (countCodes[item.code] > 1) {
      item.errors.push(`Invalid column 'code', duplicated in this file.`);
    }
    await this.validateItemNumber(item.code, item.errors, 'code');
  }

  private async validateManager(item: StakeholderDto) {
    if (item.manager && !isNumber(item.manager)) {
      item.errors.push(`Invalid column Manager, must be numeric.`);
    }
    if (item.manager && !(await this.validateManagerInDepartment(item))) {
      item.errors.push(`Invalid column Manager....`);
    }
  }

  private async validateManagerInDepartment(
    item: StakeholderDto,
  ): Promise<boolean> {
    return item.departmentsAndPositions.some(
      (i) => i.department === item.manager,
    );
  }

  private async validateAction(action: string, errors: string[]) {
    const validActions = [
      UploadFileAction.add,
      UploadFileAction.delete,
      UploadFileAction.update,
    ];

    if (!validActions.includes(action as UploadFileAction)) {
      errors.push(`Invalid column 'action', must be completed with (A, U, D)`);
    }
  }
}
