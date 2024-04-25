import { FileDto, FileItem } from '../../upload-file/dto/file.dto';

export class DepartmentFileDto extends FileDto {}
export class DepartmentDto extends FileItem {
  parent?: string | null;
  manager: string;
}
