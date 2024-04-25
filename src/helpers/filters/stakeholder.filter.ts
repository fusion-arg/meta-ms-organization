import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { Filter } from 'src/contracts/filter.contract';

export class StakeholderFilter implements Filter {
  @IsOptional()
  @IsString()
  stakeholder?: string;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((id) => id.trim());
    }
    return value;
  })
  departments?: string[];

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((id) => id.trim());
    }
    return value;
  })
  positions?: string[];
  @IsOptional()
  @IsString()
  isManager?: string;

  @IsOptional()
  @IsString()
  updatedAtFrom?: string;

  @IsOptional()
  @IsString()
  updatedAtTo?: string;

  @IsOptional()
  @IsString()
  hasDepartment?: string;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((id) => id.trim());
    }
    return value;
  })
  projectRole?: string[];

  @IsOptional()
  @IsString()
  isUser?: string;
}
