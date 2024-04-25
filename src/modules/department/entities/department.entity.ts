import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';
import { Stakeholder } from '../../stakeholder/entities/stakeholder.entity';

@Entity()
export class Department extends BaseEntity {
  @Column({ name: 'project_id', nullable: false })
  projectId: string;

  @Column({ nullable: false })
  code: number;

  @Column({ nullable: false })
  name: string;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Department;

  @OneToMany(() => Department, (department) => department.parent)
  children: Department[];

  @ManyToOne(() => Stakeholder, { nullable: true })
  @JoinColumn({ name: 'stakeholder_id' })
  manager: Stakeholder;
}
