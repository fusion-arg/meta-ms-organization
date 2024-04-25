import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';

@Entity()
export class Sprint extends BaseEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  code: number;

  @Column({ name: 'project_id', nullable: false })
  projectId: string;

  @Column({ name: 'start_date', nullable: false })
  startDate: Date;

  @Column({ name: 'due_date', nullable: false })
  dueDate: Date;
}
