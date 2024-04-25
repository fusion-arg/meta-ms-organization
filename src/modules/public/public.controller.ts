import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { SegmentationDto } from '../stakeholder/dto/segmentation.dto';
import { StakeholderService } from '../stakeholder/stakeholder.service';
import { PublicService } from './public.service';
import { StakeholderAnswersDto } from './dto/stakeholder-answers.dto';
import { StakeholderAnswersSerializer } from '../../serializers/stakeholder-answers.serializer';
import { StakeholderDetailDto } from './dto/stakeholder-detail.dto';
import { StakeholderSurveyDetailSerializer } from '../../serializers/stakeholder-survey-detail.serializer';
import { SprintService } from '../sprint/sprint.service';

@Controller('public')
export class PublicController {
  constructor(
    private stakeholders: StakeholderService,
    private sprintService: SprintService,
    private publicService: PublicService,
  ) {}

  @Get('/sprints/:sprintId')
  @HttpCode(HttpStatus.OK)
  async findSprint(@Param('sprintId') sprintId: string) {
    return await this.sprintService.findSprintForSurvey(sprintId);
  }

  @Post('/list-for-segmentation')
  @HttpCode(HttpStatus.OK)
  async activateUserlistSegmentation(@Body() body: SegmentationDto) {
    return await this.stakeholders.listSegmentation(body);
  }

  @Post('/list-departments-for-segmentation')
  @HttpCode(HttpStatus.OK)
  async listDepartmentsForSegmentation(@Body() body: any) {
    const departments = await this.publicService.getDepartments(
      body.departmentIds,
    );
    return { departments };
  }

  @Post('/list-stakeholders-for-answers')
  @HttpCode(HttpStatus.OK)
  async listStakeholdersForAnswers(@Body() body: StakeholderAnswersDto) {
    const items = await this.publicService.getStakeholdersForAnswers(body);

    const serializer = new StakeholderAnswersSerializer();

    return serializer.respondMany(items);
  }

  @Post('/stakeholder-detail')
  @HttpCode(HttpStatus.OK)
  async stakeholderDetail(@Body() body: StakeholderDetailDto) {
    const item = await this.publicService.getStakeholderDetail(body);

    const serializer = new StakeholderSurveyDetailSerializer();

    return serializer.respond(item);
  }
}
