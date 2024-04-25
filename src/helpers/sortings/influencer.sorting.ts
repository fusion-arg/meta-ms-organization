import { IsOptional } from 'class-validator';
import { Sorting } from 'src/contracts/sorting.contract';

export class InfluencerSorting implements Sorting {
  @IsOptional()
  name?: 'ASC' | 'DESC';

  @IsOptional()
  excluded?: 'ASC' | 'DESC';

  @IsOptional()
  projectRoles?: 'ASC' | 'DESC';
}
