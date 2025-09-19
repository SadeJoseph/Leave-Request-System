import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { IsNotEmpty, MaxLength } from "class-validator";

@Entity({ name: "department" })
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsNotEmpty({ message: "Name is required" })
  @MaxLength(100, { message: "Name must be less than 100 characters" })
  name: string;
}