import { Injectable } from '@nestjs/common';
import { ITask, TaskStatus } from './models/task.model';
import { CreateTaskDto, UpdateTaskDto } from './models/create-task.dto';
import { randomUUID } from 'node:crypto';
import { stat } from 'node:fs';
import { WrongTaskStatusException } from './exceptions/wrong-task-status.exception';

@Injectable()
export class TasksService {
  private tasks: ITask[] = [
    { id: '1', title: 'Task 1', description: '', status: TaskStatus.OPEN },
    { id: '2', title: 'Task 2', description: '', status: TaskStatus.DONE },
    {
      id: '3',
      title: 'Task 3',
      description: '',
      status: TaskStatus.IN_PROGRESS,
    },
  ];

  public findAll(): ITask[] {
    return this.tasks;
  }

  public findOne(id: string): ITask | undefined {
    return this.tasks.find((task) => task.id === id);
  }

  getTasksByStatus(status: string) {
    return this.tasks.filter((task) => task.status === status);
  }

  public create(createTaskDto: CreateTaskDto): ITask {
    const task: ITask = {
      id: randomUUID(),
      ...createTaskDto,
    };
    this.tasks.push(task);
    return task;
  }

    public updateTask(task: ITask, updateTaskDto: UpdateTaskDto): ITask {
      if(updateTaskDto.status && !this.isValidStatusTransition(task.status, updateTaskDto.status)) {
        throw new WrongTaskStatusException();
      }
    Object.assign(task, updateTaskDto);
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

  public deleteTask(task: ITask): void {
    this.tasks = this.tasks.filter(
      (filteredTask) => filteredTask.id !== task.id,
    );
  }
}
