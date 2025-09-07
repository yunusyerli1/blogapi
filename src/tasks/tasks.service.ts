import { Injectable } from '@nestjs/common';
import { TaskStatus } from './models/task.model';
import { CreateTaskDto, UpdateTaskDto } from './models/create-task.dto';
import { WrongTaskStatusException } from './exceptions/wrong-task-status.exception';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskLabel } from './entities/task-label.entity';
import { CreateTaskLabelDto } from './models/create-task-label.dto';

@Injectable()
export class TasksService {

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(TaskLabel)
    private readonly labelRepository: Repository<TaskLabel>
  ) {}

  public async findAll(): Promise<Task[]> {
    return await this.taskRepository.find();
  }

  public async findOne(id: string): Promise<Task | null> {
    return await this.taskRepository.findOne({
      where: { id },
      relations: ['labels'],
    });
  }

 
  public  async createTask(createTaskDto: CreateTaskDto): Promise<Task>  {
    return await this.taskRepository.save(createTaskDto);
  }

    public async updateTask(task: Task, updateTaskDto: UpdateTaskDto): Promise<Task>  {
      if(updateTaskDto.status && !this.isValidStatusTransition(task.status, updateTaskDto.status)) {
        throw new WrongTaskStatusException();
      }
    Object.assign(task, updateTaskDto);
    return await this.taskRepository.save(task);
  }

  public async addLabels(
    task: Task,
    labelDTOs: CreateTaskLabelDto[]
  ): Promise<Task> {
    const labels = labelDTOs.map(label => 
      this.labelRepository.create(label)
    );
    
    task.labels = [...task.labels, ...labels];
    return await this.labelRepository.save(task);;
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

  public async deleteTask(task: Task): Promise<void> {
    await this.taskRepository.delete(task as Task);
  }
}
