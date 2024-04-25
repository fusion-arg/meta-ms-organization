import { IsOptional } from 'class-validator';
import { Sorting } from 'src/contracts/sorting.contract';

export class PositionSorting implements Sorting {
  @IsOptional()
  name?: 'ASC' | 'DESC';

  @IsOptional()
  code?: 'ASC' | 'DESC';

  @IsOptional()
  updatedAt?: 'ASC' | 'DESC';
}
