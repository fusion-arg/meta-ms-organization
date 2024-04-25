import { IsIn } from 'class-validator';

export class DepartmentCsvHeaderDto {
  @IsIn(['code', 'name', 'parent', 'manager', 'action'], {
    message: 'Invalid header: code',
  })
  code: string;

  @IsIn(['code', 'name', 'parent', 'manager', 'action'], {
    message: 'Invalid header: name',
  })
  name: string;

  @IsIn(['code', 'name', 'parent', 'manager', 'action'], {
    message: 'Invalid header: parent',
  })
  parent: string;

  @IsIn(['code', 'name', 'parent', 'manager', 'action'], {
    message: 'Invalid header: manager',
  })
  manager: string;

  @IsIn(['code', 'name', 'parent', 'manager', 'action'], {
    message: 'Invalid header: action',
  })
  action: string;
}
