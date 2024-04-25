import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';

export class InfluencesType {
  @IsBoolean()
  sme: boolean;

  @IsBoolean()
  pkl: boolean;

  @IsBoolean()
  skl: boolean;

  @IsBoolean()
  mapper: boolean;

  @IsBoolean()
  influencer: boolean;
}
export class InfluencerUpdate {
  @IsString()
  processId: string;

  @IsBoolean()
  excluded: boolean;

  @ValidateNested({ each: true })
  @Type(() => InfluencesType)
  influences: InfluencesType;
}
