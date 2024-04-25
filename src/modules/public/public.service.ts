import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Department } from '../department/entities/department.entity';
import { Repository } from 'typeorm';
import { StakeholderAnswersDto } from './dto/stakeholder-answers.dto';
import { Stakeholder } from '../stakeholder/entities/stakeholder.entity';
import { StakeholderDetailDto } from './dto/stakeholder-detail.dto';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(Department)
    private departmentRepo: Repository<Department>,
    @InjectRepository(Stakeholder)
    private stakeholderRepo: Repository<Stakeholder>,
  ) {}

  async getDepartments(departmentIds: string) {
    return await this.departmentRepo
      .createQueryBuilder('department')
      .select(['department.id', 'department.name'])
      .whereInIds(departmentIds)
      .getMany();
  }

  async getStakeholdersForAnswers(data: StakeholderAnswersDto) {
    const query = this.stakeholderRepo
      .createQueryBuilder('stakeholder')
      .innerJoinAndSelect('stakeholder.stakeholderUser', 'user')
      .leftJoinAndSelect('stakeholder.projectRole', 'projectRole')
      .leftJoinAndSelect('stakeholder.stakeholderDepartmentPositions', 'sdp')
      .leftJoinAndSelect('sdp.department', 'department')
      .leftJoinAndSelect('sdp.position', 'position')
      .leftJoinAndSelect('stakeholder.influencers', 'influencer')
      .leftJoinAndSelect('influencer.influences', 'influence')
      .andWhere('stakeholder.projectId = :projectId', {
        projectId: data.projectId,
      })
      .andWhere('user.userId IN (:...userIds)', {
        userIds: data.userIds,
      });

    if (data.stakeholder !== '') {
      query.andWhere(
        `stakeholder.name LIKE :stakeholderParam OR stakeholder.code LIKE :stakeholderParam OR stakeholder.email LIKE :stakeholderParam`,
        { stakeholderParam: `%${data.stakeholder}%` },
      );
    }

    if (data.projectRoles.length > 0) {
      query.andWhere(`projectRole.id IN (:...projectRoles)`, {
        projectRoles: data.projectRoles,
      });
    }
    if (data.departments.length > 0) {
      query.andWhere('department.id IN (:...departments)', {
        departments: data.departments,
      });
    }

    if (data.positions.length > 0) {
      query.andWhere('position.id IN (:...positions)', {
        positions: data.positions,
      });
    }

    if (data.influencerTypes.length > 0) {
      query.andWhere('influence.type IN (:...influencerTypes)', {
        influencerTypes: data.influencerTypes,
      });
    }

    if (data.stakeholderOrder) {
      query.orderBy('stakeholder.name', data.stakeholderOrder);
    }

    return await query.getMany();
  }

  async getStakeholderDetail(data: StakeholderDetailDto) {
    return await this.stakeholderRepo
      .createQueryBuilder('stakeholder')
      .leftJoinAndSelect('stakeholder.stakeholderDepartmentPositions', 'sdp')
      .leftJoinAndSelect('sdp.department', 'department')
      .leftJoinAndSelect('sdp.position', 'position')
      .leftJoinAndSelect('stakeholder.stakeholderUser', 'user')
      .leftJoinAndSelect('stakeholder.influencers', 'influencer')
      .leftJoinAndSelect('influencer.influences', 'influence')
      .andWhere('stakeholder.projectId = :projectId', {
        projectId: data.projectId,
      })
      .andWhere('user.userId = :userId', {
        userId: data.userId,
      })
      .getOneOrFail();
  }
}
