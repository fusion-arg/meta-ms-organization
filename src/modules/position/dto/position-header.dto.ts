import { IsIn } from 'class-validator';

export class PositionDtoCsvHeaderDto {
  @IsIn(['name', 'code', 'action'], {
    message: 'Invalid header: name',
  })
  name: string;

  @IsIn(['name', 'code', 'action'], {
    message: 'Invalid header: code',
  })
  code: string;

  @IsIn(['name', 'code', 'action'], {
    message: 'Invalid header: action',
  })
  action: string;
}
