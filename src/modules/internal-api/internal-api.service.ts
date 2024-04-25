import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { InfluenceTypes } from 'src/enum/influence-types.enum';
import { Influencer } from 'src/modules/influencer/entities/influencer.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class InternalApiService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async getMappers(projectId: string) {
    const items = await this.entityManager
      .getRepository(Influencer)
      .createQueryBuilder('influencer')
      .leftJoinAndSelect('influencer.influences', 'influences')
      .leftJoinAndSelect('influencer.stakeholder', 's')
      .leftJoinAndSelect('s.stakeholderUser', 'user')
      .andWhere('influencer.projectId = :projectId', {
        projectId,
      })
      .andWhere('influences.type = :type', {
        type: InfluenceTypes.mapper,
      })
      .getMany();

    return items.map((item) => ({
      userId: item.stakeholder.stakeholderUser.userId,
      selectedFutureProcess: item.selectedFutureProcess,
    }));
  }
}
