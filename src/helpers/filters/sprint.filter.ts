import { IsOptional, IsString } from 'class-validator';
import { Filter } from 'src/contracts/filter.contract';

export class SprintFilter implements Filter {
  @IsOptional()
  @IsString()
  sprint?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
