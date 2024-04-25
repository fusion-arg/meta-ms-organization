import { IsIn } from 'class-validator';

export class StakeholderCsvHeaderDto {
  @IsIn(
    [
      'name',
      'email',
      'stakeholderId',
      'department',
      'manager',
      'projectRole',
      'action',
    ],
    {
      message: 'Invalid header: stakeholderId',
    },
  )
  stakeholderId: string;

  @IsIn(
    [
      'name',
      'email',
      'stakeholderId',
      'department',
      'manager',
      'projectRole',
      'action',
    ],
    {
      message: 'Invalid header: name',
    },
  )
  name: string;

  @IsIn(
    [
      'name',
      'email',
      'stakeholderId',
      'department',
      'manager',
      'projectRole',
      'action',
    ],
    {
      message: 'Invalid header: email',
    },
  )
  email: string;

  @IsIn(
    [
      'name',
      'email',
      'stakeholderId',
      'department',
      'manager',
      'projectRole',
      'action',
    ],
    {
      message: 'Invalid header: department',
    },
  )
  department: string;

  @IsIn(
    [
      'name',
      'email',
      'stakeholderId',
      'department',
      'manager',
      'projectRole',
      'action',
    ],
    {
      message: 'Invalid header: manager',
    },
  )
  manager: string;

  @IsIn(
    [
      'name',
      'email',
      'stakeholderId',
      'department',
      'manager',
      'projectRole',
      'action',
    ],
    {
      message: 'Invalid header: projectRole',
    },
  )
  projectRole: string;

  @IsIn(
    [
      'name',
      'email',
      'stakeholderId',
      'department',
      'manager',
      'projectRole',
      'action',
    ],
    {
      message: 'Invalid header: action',
    },
  )
  action: string;
}
