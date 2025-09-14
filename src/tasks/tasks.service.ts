import { Injectable } from '@nestjs/common';
import { TaskStatus } from './models/task.model';
import { CreateTaskDto, UpdateTaskDto } from './models/create-task.dto';
import { WrongTaskStatusException } from './exceptions/wrong-task-status.exception';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskLabel } from './entities/task-label.entity';
import { CreateTaskLabelDto } from './models/create-task-label.dto';
import { FindTaskParams } from './models/find-task.param';
import { FindTasksQueryDto } from 'src/common/pagination.params';

@Injectable()
export class TasksService {

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(TaskLabel)
    private readonly labelRepository: Repository<TaskLabel>
  ) {}

  public async findAll(filters: FindTaskParams, pagination: FindTasksQueryDto): Promise<[Task[], number]> {
    const query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.labels', 'labels');
  
    if (filters.status) {
      query.andWhere('task.status = :status', { status: filters.status });
    }
  
    if (filters.search?.trim()) {
      query.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters.labels?.length) {
      const subQuery = query
        .subQuery()
        .select('labels.taskId')
        .from('task_label', 'labels')
        .where('labels.name IN (:...names)', { names: filters.labels })
        .getQuery();

      query.andWhere(`task.id IN ${subQuery}`);
    }
    query.orderBy(`task.${filters.sortBy}`, filters.sortOrder);
    query.skip(pagination.offset).take(pagination.limit);
    return query.getManyAndCount();
  }

  public async findOne(id: string): Promise<Task | null> {
    return await this.taskRepository.findOne({
      where: { id },
      relations: ['labels'],
    });
  }

 
  public  async createTask(createTaskDto: CreateTaskDto): Promise<Task>  {
    if(createTaskDto.labels) {
      createTaskDto.labels = this.getUniqueLabels(createTaskDto.labels);
    }
    return await this.taskRepository.save(createTaskDto);
  }

    public async updateTask(task: Task, updateTaskDto: UpdateTaskDto): Promise<Task>  {
      if(updateTaskDto.status && !this.isValidStatusTransition(task.status, updateTaskDto.status)) {
        throw new WrongTaskStatusException();
      }

      if(updateTaskDto.labels) {
        updateTaskDto.labels = this.getUniqueLabels(updateTaskDto.labels);
      }

    Object.assign(task, updateTaskDto);
    return await this.taskRepository.save(task);
  }

  public async deleteTask(task: Task): Promise<void> {
    await this.taskRepository.delete(task.id);
  }

  public async removeLabels(task: Task, labelsToRemove: string[]): Promise<Task> {
    task.labels = task?.labels.filter(label => !labelsToRemove.includes(label.name));
    return await this.taskRepository.save(task);
  }

  public async addLabels(
    task: Task,
    labelDTOs: CreateTaskLabelDto[]
  ): Promise<Task> {
    const existingNames =  new Set(task.labels?.map(label => label.name));
    const labels = this.getUniqueLabels(labelDTOs)
      .filter(labelDto => !existingNames.has(labelDto.name))
      .map((label) => this.labelRepository.create(label));
    
    if(labels.length) {
      task.labels = [...task.labels, ...labels];
    
    return await this.taskRepository.save(task);
    }

    return task;
  }

  private isValidStatusTransition(
    currentStatus: TaskStatus,
    newStatus: TaskStatus,
  ): boolean {
    const statusOrder = [
      TaskStatus.OPEN,
      TaskStatus.IN_PROGRESS,
      TaskStatus.DONE,
    ];  
    return statusOrder.indexOf(currentStatus) <= statusOrder.indexOf(newStatus);
  }

  private getUniqueLabels(labelDtos: CreateTaskLabelDto[]): CreateTaskLabelDto[] {
    const uniqueNames = [...new Set(labelDtos.map(label => label.name))];
    return uniqueNames.map(name => ({ name }));
  }
}
