import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreatePostData {
  @IsNumber()
  code: number;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  comment: string | null;
}
