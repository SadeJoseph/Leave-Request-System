import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";
import { Role } from "./Role";
import { Department } from "./Department";
import { UserManagement } from "./UserManagement"; 
import { Exclude } from "class-transformer";

@Entity({ name: "user" })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  firstname: string;

  @Column({ length: 100 })
  surname: string;

  @Column({ unique: true })
  @IsEmail({}, { message: "Must be a valid email address" })
  email: string;

  @Column()
  @IsString()
  @MinLength(10, { message: "Password must be at least 10 characters long" })
  password: string;

  @Column({ select: false }) 
  @Exclude()
  salt: string;

  @ManyToOne(() => Role, { nullable: false, eager: true })
  @JoinColumn({ name: "roleId" })
  @IsNotEmpty({ message: "Role must not be empty" })
  role: Role;
  
@OneToMany(() => UserManagement, (um) => um.user)
assignmentsAsEmployee: UserManagement[];

@OneToMany(() => UserManagement, (um) => um.manager)
assignmentsAsManager: UserManagement[];

  @ManyToOne(() => Department, { eager: true, nullable: false })
  department: Department;

  @Column("decimal", { precision: 5, scale: 2, default: 25.0 })
  annualLeaveBalance: number;
}
