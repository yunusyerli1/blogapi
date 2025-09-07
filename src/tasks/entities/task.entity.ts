import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TaskStatus } from "../models/task.model";
import { User } from "src/users/user.entity";
import { TaskLabel } from "./task-label.entity";

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

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column()
    userId: string;

    @ManyToOne(() => User, user => user.tasks, {nullable: false})
    user: User;

    @OneToMany(() => TaskLabel, label => label.task, {
        cascade: true,
    })
    labels: TaskLabel[];
}