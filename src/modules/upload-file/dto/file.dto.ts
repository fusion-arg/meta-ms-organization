export interface CountMap {
  [key: string]: number;
}

export class FileItem {
  row: number;
  name: string;
  code: string;
  action: string;
  errors: string[];
}

export class FileDto {
  file: string;
  names: string[];
  codes: string[];
  items: FileItem[];
  hasErrors: boolean;
}
