import { IsNotEmpty, IsString } from 'class-validator';

export class StakeholderProjectDoleDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}
