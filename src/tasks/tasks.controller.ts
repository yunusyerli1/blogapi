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
  Post
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { FindOneParams } from './models/find-one.params';
import { CreateTaskDto, UpdateTaskDto } from './models/create-task.dto';
import { WrongTaskStatusException } from './exceptions/wrong-task-status.exception';
import { Task } from './entities/task.entity';
import { CreateTaskLabelDto } from './models/create-task-label.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  public async findAll(): Promise<Task[]> {
    return this.tasksService.findAll();
  }

  @Get(':id')
  public async findOne(@Param() params: FindOneParams): Promise<Task>  {
    return await this.findOneOrFail(params.id);

  }

  @Post()
  public async create(@Body() createTaskDto: CreateTaskDto): Promise<Task>   {
    return this.tasksService.createTask(createTaskDto);
  }

  @Patch('/:id')
  public async updateTask(
    @Param() params: FindOneParams,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    console.log("params", params);
    console.log("params.id", params.id);
    const task = await this.findOneOrFail(params.id);
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
  public async deleteTask(@Param() params: FindOneParams): Promise<void>  {
    const task = await this.findOneOrFail(params.id);
    await this.tasksService.deleteTask(task);
  }

  @Post('/:id/labels')
  async addLabels(
    @Param('id') id: string,
    @Body() labels: CreateTaskLabelDto[],
  ) {

    console.log("Adding labels to task id:", id);
    console.log("Labels:", labels);
    const task = await this.tasksService.findOne(id);
    console.log("task:", labels);
    if (!task) throw new NotFoundException();
    return this.tasksService.addLabels(task, labels);
  }

  private async findOneOrFail(id: string): Promise<Task> {
    const task = await this.tasksService.findOne(id);

    if (!task) {
      throw new NotFoundException();
    }

    return task;
  }



}
