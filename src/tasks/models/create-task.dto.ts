import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { TaskStatus } from './task.model';


export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsEnum(TaskStatus)
  status: TaskStatus;
}


export class UpdateTaskDto extends PartialType(CreateTaskDto) {}