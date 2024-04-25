import { IsOptional } from 'class-validator';
import { Sorting } from 'src/contracts/sorting.contract';

export class StakeholderSorting implements Sorting {
  @IsOptional()
  name?: 'ASC' | 'DESC';

  @IsOptional()
  email?: 'ASC' | 'DESC';

  @IsOptional()
  code?: 'ASC' | 'DESC';

  @IsOptional()
  projectRole?: 'ASC' | 'DESC';
}
