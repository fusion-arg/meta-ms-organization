import { IsDateString, IsNumber, IsString } from 'class-validator';

export class SprintDto {
  @IsString()
  name: string;

  @IsNumber()
  code: number;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;
}
