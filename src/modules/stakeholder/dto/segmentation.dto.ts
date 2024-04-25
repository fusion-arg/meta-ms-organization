import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';

export class SegmentationDto {
  @IsString()
  projectId: string;

  @ArrayNotEmpty()
  departments: string[];

  @IsBoolean()
  includeChildren: boolean;

  @IsBoolean()
  allDepartmentStakeholders: boolean;

  @IsBoolean()
  allInfluencerStakeholders: boolean;

  @IsBoolean()
  associatedInfluencers: boolean;

  @IsBoolean()
  includingExcluded: boolean;

  @IsArray()
  @IsOptional()
  processes: string[] = [];
}
