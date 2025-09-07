import { Injectable } from '@nestjs/common';
import { TaskStatus } from './models/task.model';
import { CreateTaskDto, UpdateTaskDto } from './models/create-task.dto';
import { WrongTaskStatusException } from './exceptions/wrong-task-status.exception';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TasksService {

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>
  ) {}

  public async findAll(): Promise<Task[]> {
    return await this.taskRepository.find();
  }

  public async findOne(id: string): Promise<Task | null> {
    return await this.taskRepository.findOneBy({id});
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
