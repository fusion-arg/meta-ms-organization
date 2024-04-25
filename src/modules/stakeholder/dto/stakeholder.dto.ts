export class StakeholderDto {
  row: number;
  name: string;
  email: string;
  stakeholderId: string;
  departmentsAndPositions: DepartmentAndPosition[];
  manager: string;
  projectRole: string;
  projectRoleId: string;
  action: string;
  errors: string[];
}

export class DepartmentAndPosition {
  department: string;
  positions: string[];
}
export class StakeholderFileDto {
  file: string;
  emails: string[];
  stakeholderIds: string[];
  items: StakeholderDto[];
  hasErrors: boolean;
}
