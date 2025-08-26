import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import type { ITask } from './models/task.model';
import type { FindOneParams } from './models/find-one.params';
import { CreateTaskDto, UpdateTaskDto } from './models/create-task.dto';
import { WrongTaskStatusException } from './exceptions/wrong-task-status.exception';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  public findOne(@Param() params: FindOneParams): ITask {
    const task = this.tasksService.findOne(params.id);

    if (task) {
      return task;
    }

    throw new NotFoundException();
  }

  @Get('status/:status')
  getTasksByStatus(@Param('status') status: string) {
    return this.tasksService.getTasksByStatus(status);
  }

  @Post()
  public create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  /*   @Put(':id')
  updateTask(
    @Param() params: FindOneParams,
    @Body() updateTaskDto: UpdateTaskDto
  ): ITask {
    const task = this.findOneOrFail(params.id);
    return this.tasksService.updateTask(task, updateTaskDto);
  } */

  @Patch('/:id')
  public updateTask(
    @Param() params: FindOneParams,
    @Body() updateTaskDto: UpdateTaskDto,
  ): ITask {
    const task = this.findOneOrFail(params.id);
    try {
        return this.tasksService.updateTask(task, updateTaskDto);
    } catch (error) {
      if(error instanceof WrongTaskStatusException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public deleteTask(@Param() params: FindOneParams): void {
    const task = this.findOneOrFail(params.id);
    this.tasksService.deleteTask(task);
  }

  private findOneOrFail(id: string): ITask {
    const task = this.tasksService.findOne(id);

    if (!task) {
      throw new NotFoundException();
    }

    return task;
  }
}
