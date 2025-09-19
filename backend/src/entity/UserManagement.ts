import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { IsNotEmpty } from "class-validator";

@Entity({ name: "user_management" })
export class UserManagement {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User, (user) => user.assignmentsAsEmployee)
@JoinColumn({ name: "userId" })
user: User;

@ManyToOne(() => User, (user) => user.assignmentsAsManager)
@JoinColumn({ name: "managerId" })
manager: User;

  @Column({ type: "date", nullable: true })
  startDate: Date;

  @Column({ type: "date", nullable: true })
  endDate: Date;
}
