import { IsIn } from 'class-validator';

export class InfluencerCsvHeaderDto {
  @IsIn(['stakeholderId', 'influence', 'excluded', 'action'], {
    message: 'Invalid header: stakeholderId',
  })
  stakeholderId: string;

  @IsIn(['stakeholderId', 'influence', 'excluded', 'action'], {
    message: 'Invalid header: influence',
  })
  influence: string;

  @IsIn(['stakeholderId', 'influence', 'excluded', 'action'], {
    message: 'Invalid header: excluded',
  })
  excluded: string;

  @IsIn(['stakeholderId', 'influence', 'excluded', 'action'], {
    message: 'Invalid header: action',
  })
  action: string;
}
