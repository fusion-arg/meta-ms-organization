export interface CountMap {
  [key: string]: number;
}

export class InfluencerItem {
  row: number;
  stakeholderCode: string;
  influence: string;
  excluded: string;
  action: string;
  stakeholderId: string;
  errors: string[];
}

export class InfluencerDto {
  file: string;
  stakeholderIds: string[];
  items: InfluencerItem[];
  hasErrors: boolean;
}
