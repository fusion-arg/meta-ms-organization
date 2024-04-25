import { IsString } from 'class-validator';

export class CreateClientUserDto {
  @IsString()
  projectId: string;

  users: UserDto[];
}

export class UserDto {
  @IsString()
  name: string;

  @IsString()
  email: string;
}
