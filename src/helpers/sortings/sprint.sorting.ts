import { IsOptional } from 'class-validator';
import { Sorting } from 'src/contracts/sorting.contract';

export class SprintSorting implements Sorting {
  @IsOptional()
  code?: 'ASC' | 'DESC';

  @IsOptional()
  name?: 'ASC' | 'DESC';

  @IsOptional()
  startDate?: 'ASC' | 'DESC';

  @IsOptional()
  dueDate?: 'ASC' | 'DESC';
}
