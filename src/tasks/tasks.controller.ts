import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { FindOneParams } from './models/find-one.params';
import { CreateTaskDto, UpdateTaskDto } from './models/create-task.dto';
import { WrongTaskStatusException } from './exceptions/wrong-task-status.exception';
import { Task } from './entities/task.entity';
import { CreateTaskLabelDto } from './models/create-task-label.dto';
import { FindTasksQueryDto } from 'src/common/pagination.params';
import { PaginationResponse } from 'src/common/pagination.response';
import type { AuthRequest } from 'src/users/models/auth.request';
import { CurrentUserId } from './../users/decorators/current-user-id.decorator';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {
    console.log('TasksController constructor');
  }

  @Get()
  public async findAll(
    @Query() query: FindTasksQueryDto,
    @CurrentUserId() userId: string,
  ): Promise<PaginationResponse<Task>> {
    const pagination = {
      limit: query.limit,
      offset: query.offset,
    };

    const { limit, offset, ...filters } = query;

    const [items, total] = await this.tasksService.findAll(filters, pagination, userId);

    return {
      data: items,
      meta: {
        total: total,
        offset: pagination.offset,
        limit: pagination.limit,
      },
    };
  }

   @Get('/:id')
  public async findOne(
    @Param() params: FindOneParams,
    @CurrentUserId() userId: string,
  ): Promise<Task> {
    const task = await this.findOneOrFail(params.id);
    this.checkTaskOwnership(task, userId);
    return task;
  }

  @Post()
  public async create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUserId() userId: string,
   // @Request() request: AuthRequest,
  ): Promise<Task> {
   console.log("Create method called");
  console.log("userId in create", userId);
    return await this.tasksService.createTask({
      ...createTaskDto,
      userId,
    });
  }

  @Patch('/:id')
  public async updateTask(
    @Param() params: FindOneParams,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUserId() userId: string,
  ): Promise<Task> {
    const task = await this.findOneOrFail(params.id);
    this.checkTaskOwnership(task, userId);
    try {
      return await this.tasksService.updateTask(task, updateTaskDto);
    } catch (error) {
      if (error instanceof WrongTaskStatusException) {
        throw new BadRequestException([error.message]);
      }
      throw error;
    }
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteTask(
    @Param() params: FindOneParams,
    @CurrentUserId() userId: string,
  ): Promise<void> {
    const task = await this.findOneOrFail(params.id);
    this.checkTaskOwnership(task, userId);
    await this.tasksService.deleteTask(task);
  }

  @Post(':id/labels')
  async addLabels(
    @Param() { id }: FindOneParams,
    @Body() labels: CreateTaskLabelDto[],
    @CurrentUserId() userId: string,
  ): Promise<Task> {
    const task = await this.findOneOrFail(id);
    this.checkTaskOwnership(task, userId);
    return await this.tasksService.addLabels(task, labels);
  }

  @Delete(':id/labels')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeLabels(
    @Param() { id }: FindOneParams,
    @Body() labelNames: string[],
    @CurrentUserId() userId: string,
  ): Promise<void> {
    const task = await this.findOneOrFail(id);
    this.checkTaskOwnership(task, userId);
    await this.tasksService.removeLabels(task, labelNames);
  }

  private async findOneOrFail(id: string): Promise<Task> {
    const task = await this.tasksService.findOne(id);

    if (!task) {
      throw new NotFoundException();
    }

    return task;
  }

   private checkTaskOwnership(task: Task, userId: string): void {
    if (task.userId !== userId) {
      throw new ForbiddenException('You can only access your own tasks');
    }
  }
}
