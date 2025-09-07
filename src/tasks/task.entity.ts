import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { TaskStatus } from "./models/task.model";

@Entity()
export class Task {
    @PrimaryGeneratedColumn('uuid')  //postgres generally use uuid as primary key
    id: string;

    @Column({
        type: 'varchar',
        length: 100,
        nullable: false
    })
    title: string;

    @Column({
        type: 'text',
        nullable: true
    })
    description: string;
    
    @Column({
        type: 'enum',
        enum: TaskStatus,
        default: TaskStatus.OPEN
    })
    status: TaskStatus

    createdAt: Date;
    updatedAt: Date;
}