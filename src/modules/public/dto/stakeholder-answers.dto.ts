import { IsArray, IsOptional, IsString } from 'class-validator';

export class StakeholderAnswersDto {
  @IsString()
  projectId: string;

  @IsString()
  stakeholder: string;

  @IsArray()
  departments: string[] = [];

  @IsOptional()
  projectRoles?: string[] = [];

  @IsArray()
  positions: string[] = [];

  @IsArray()
  influencerTypes: string[] = [];

  @IsOptional()
  stakeholderOrder?: 'ASC' | 'DESC';

  @IsArray()
  userIds: string[] = [];
}
