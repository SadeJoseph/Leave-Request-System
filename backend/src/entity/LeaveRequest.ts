import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";
import { IsNotEmpty } from "class-validator";

@Entity({ name: "leave_request" })
export class LeaveRequest {
  @PrimaryGeneratedColumn({ name: 'leaveRequestId' })
  id: number;

  @ManyToOne(() => User, { nullable: false })
  @IsNotEmpty({ message: "User is required" })
  user: User;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'varchar', default: 'Annual Leave' })
  leaveType: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'enum', enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' })
  status: 'Pending' | 'Approved' | 'Rejected';
}
