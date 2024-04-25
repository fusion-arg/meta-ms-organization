import { Test, TestingModule } from '@nestjs/testing';
import { PositionFileDto } from './dto/position.dto';
import { PositionService } from './position.service';
import { PositionsValidateService } from './positions-validate.service';
import { BadRequestException } from '@nestjs/common';
import { Position } from './entities/position.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ValidateFileService } from '../upload-file/validate-file.service';

describe('processPositions', () => {
  let positionsValidateService: PositionsValidateService;
  let positionService: PositionService;
  let projectId: string;
  let positionsFileDto: PositionFileDto;
  let positionRepository: Repository<Position>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PositionService,
        PositionsValidateService,
        ValidateFileService,
        {
          provide: getRepositoryToken(Position),
          useClass: Repository,
        },
      ],
    }).compile();

    positionService = module.get<PositionService>(PositionService);
    positionsValidateService = module.get<PositionsValidateService>(
      PositionsValidateService,
    );
    positionRepository = module.get<Repository<Position>>(
      getRepositoryToken(Position),
    );

    projectId = '123';
    positionsFileDto = {
      file: 'test.csv',
      codes: [],
      names: [],
      items: [
        {
          row: 1,
          action: 'A',
          code: '100',
          name: 'Software Engineer',
          errors: [],
        },
        {
          row: 2,
          action: 'U',
          code: '200',
          name: 'Data Analyst',
          errors: [],
        },
        {
          row: 3,
          action: 'D',
          code: '300',
          name: 'Financial Accountant',
          errors: [],
        },
        {
          row: 4,
          action: 'A',
          code: '400',
          name: 'Software Engineer 2',
          errors: [],
        },
      ],
      hasErrors: false,
    };
  });

  it('should validate the positions and throw an error if there are errors', async () => {
    positionsFileDto.hasErrors = true;
    jest
      .spyOn(positionsValidateService, 'validatePosition')
      .mockImplementation((): any => positionsFileDto);

    await expect(
      positionService.processPositions(projectId, positionsFileDto),
    ).rejects.toThrow(BadRequestException);
  });

  it('should insert positions into the database', async () => {
    const mockInserts = [
      {
        id: 'uuid',
        externalId: parseInt(positionsFileDto.items[0].code),
        name: positionsFileDto.items[0].name,
        projectId,
      },
      {
        id: 'uuid',
        externalId: parseInt(positionsFileDto.items[3].code),
        name: positionsFileDto.items[3].name,
        projectId,
      },
    ];
    jest
      .spyOn(positionRepository, 'create')
      .mockImplementation((): any => mockInserts);
    jest
      .spyOn(positionRepository, 'save')
      .mockImplementation((): any => mockInserts);
    await positionService.handleInserts(projectId, [
      positionsFileDto.items[0],
      positionsFileDto.items[3],
    ]);

    expect(mockInserts).toHaveLength(2);
    expect(mockInserts[0].externalId).toBe(100);
    expect(mockInserts[0].name).toBe('Software Engineer');
    expect(mockInserts[1].externalId).toBe(400);
    expect(mockInserts[1].name).toBe('Software Engineer 2');
    expect(positionRepository.create).toHaveBeenCalledTimes(mockInserts.length);
    expect(positionRepository.create).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        externalId: 100,
        name: 'Software Engineer',
        projectId: '123',
      }),
    );
    expect(positionRepository.create).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        externalId: 400,
        name: 'Software Engineer 2',
        projectId: '123',
      }),
    );
    expect(positionRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should not insert positions if there are no positions to insert', async () => {
    const positionsDto = [];
    jest.spyOn(positionRepository, 'create');
    jest.spyOn(positionRepository, 'save');
    await positionService.handleInserts(projectId, positionsDto);

    expect(positionRepository.create).toHaveBeenCalledTimes(0);
    expect(positionRepository.save).toHaveBeenCalledTimes(0);
  });

  it('should handle updates', async () => {
    const mockUpdates = [
      {
        id: 'uuid',
        externalId: parseInt(positionsFileDto.items[1].code),
        name: positionsFileDto.items[1].name,
        projectId,
      },
    ];
    const mockItemEntity: Position = {
      id: mockUpdates[0].id,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      projectId,
      name: mockUpdates[0].name,
      externalId: mockUpdates[0].externalId,
      stakeholders: null,
    };
    jest.spyOn(positionRepository, 'findOne').mockResolvedValue(mockItemEntity);
    jest
      .spyOn(positionRepository, 'save')
      .mockImplementation((): any => mockUpdates);
    await positionService.handleUpdates(projectId, [positionsFileDto.items[1]]);

    expect(mockUpdates).toHaveLength(1);
    expect(mockUpdates[0].externalId).toBe(200);
    expect(mockUpdates[0].name).toBe('Data Analyst');
    expect(positionRepository.findOne).toHaveBeenCalledTimes(1);
    expect(positionRepository.findOne).toHaveBeenCalledWith({
      where: {
        projectId,
        externalId: parseInt(positionsFileDto.items[1].code),
      },
    });
    expect(positionRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should handle deletions', async () => {
    const mockDeletions = [
      {
        id: 'uuid',
        externalId: parseInt(positionsFileDto.items[2].code),
        name: positionsFileDto.items[2].name,
        projectId,
      },
    ];
    const mockItemEntity: Position = {
      id: mockDeletions[0].id,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      projectId,
      name: mockDeletions[0].name,
      externalId: mockDeletions[0].externalId,
      stakeholders: null,
    };
    jest.spyOn(positionRepository, 'findOne').mockResolvedValue(mockItemEntity);
    jest
      .spyOn(positionRepository, 'softRemove')
      .mockImplementation((): any => mockDeletions);
    await positionService.handleDeletions(projectId, [
      positionsFileDto.items[2],
    ]);

    expect(mockDeletions).toHaveLength(1);
    expect(mockDeletions[0].externalId).toBe(300);
    expect(mockDeletions[0].name).toBe('Financial Accountant');
    expect(positionRepository.findOne).toHaveBeenCalledTimes(1);
    expect(positionRepository.findOne).toHaveBeenCalledWith({
      where: {
        projectId,
        externalId: parseInt(positionsFileDto.items[2].code),
      },
    });
    expect(positionRepository.softRemove).toHaveBeenCalledTimes(1);
  });

  it('should return a response DTO with the number of insertions, updates, and deletions', async () => {
    jest
      .spyOn(positionsValidateService, 'validatePosition')
      .mockImplementation((): any => positionsFileDto);

    jest
      .spyOn(positionService, 'handleInserts')
      .mockImplementation((): any => [
        positionsFileDto.items[0],
        positionsFileDto.items[3],
      ]);

    jest
      .spyOn(positionService, 'handleUpdates')
      .mockImplementation((): any => positionsFileDto.items[1]);

    jest
      .spyOn(positionService, 'handleDeletions')
      .mockImplementation((): any => positionsFileDto.items[2]);

    const responseDto = await positionService.processPositions(
      projectId,
      positionsFileDto,
    );

    expect(responseDto).toEqual({
      name: 'test.csv',
      additions: 2,
      updates: 1,
      deletions: 1,
    });
    expect(positionsValidateService.validatePosition).toHaveBeenCalledTimes(1);
    expect(positionsValidateService.validatePosition).toHaveBeenCalledWith(
      projectId,
      positionsFileDto,
    );
    expect(positionService.handleInserts).toHaveBeenCalledTimes(1);
    expect(positionService.handleInserts).toHaveBeenCalledWith(projectId, [
      positionsFileDto.items[0],
      positionsFileDto.items[3],
    ]);
    expect(positionService.handleUpdates).toHaveBeenCalledTimes(1);
    expect(positionService.handleUpdates).toHaveBeenCalledWith(projectId, [
      positionsFileDto.items[1],
    ]);
    expect(positionService.handleDeletions).toHaveBeenCalledTimes(1);
    expect(positionService.handleDeletions).toHaveBeenCalledWith(projectId, [
      positionsFileDto.items[2],
    ]);
  });
});
