import { IsOptional, IsString } from 'class-validator';
import { Filter } from 'src/contracts/filter.contract';

export class DepartmentFilter implements Filter {
  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  parentDepartment?: string;
}
