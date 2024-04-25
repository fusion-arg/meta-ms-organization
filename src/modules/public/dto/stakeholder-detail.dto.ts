import { IsString } from 'class-validator';

export class StakeholderDetailDto {
  @IsString()
  projectId: string;

  @IsString()
  userId: string;
}
