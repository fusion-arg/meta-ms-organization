import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Filter } from 'src/contracts/filter.contract';

export class PositionFilter implements Filter {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsBoolean()
  hasStakeholder?: string;

  @IsOptional()
  @IsString()
  updatedAtFrom?: string;

  @IsOptional()
  @IsString()
  updatedAtTo?: string;
}
