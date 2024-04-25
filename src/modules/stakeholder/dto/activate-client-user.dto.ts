import { IsString } from 'class-validator';

export class ActivateClientUserDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  projectId: string;
}
