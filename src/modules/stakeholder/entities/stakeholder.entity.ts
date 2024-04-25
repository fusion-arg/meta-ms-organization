import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';
import { StakeholderDepartmentPosition } from './stakeholder-department-position.entity';
import { StakeholderUser } from './stakeholder-user.entity';
import { Influencer } from '../../influencer/entities/influencer.entity';
import { ProjectRole } from '../../project-role/entities/proyect-role.entity';

@Entity()
export class Stakeholder extends BaseEntity {
  @Column({ name: 'code', nullable: false, unique: true })
  code: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  email: string;

  @Column({ name: 'project_id', nullable: false })
  projectId: string;

  @OneToMany(
    () => StakeholderDepartmentPosition,
    (stakeholderDepartmentPosition) =>
      stakeholderDepartmentPosition.stakeholder,
  )
  stakeholderDepartmentPositions: StakeholderDepartmentPosition[];

  @OneToOne(() => StakeholderUser, (user) => user.stakeholder)
  stakeholderUser: StakeholderUser;

  @OneToMany(() => Influencer, (influencer) => influencer.stakeholder)
  influencers: Influencer[];

  @ManyToOne(() => ProjectRole, (projectRole) => projectRole.stakeholders)
  @JoinColumn({ name: 'project_role' })
  projectRole: ProjectRole;
}
