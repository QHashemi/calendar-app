import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { User } from "./UserModel";

@Entity()
export class Credential {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  password_hash!: string; // store hashed password (bcrypt, argon2, etc.)

  @Column({ length: 20 })
  password_algo!: string; // e.g. "bcrypt", "argon2"

  @Column({ default: 0 })
  failed_attempts!: number;

  @Column({ type: "timestamp", nullable: true })
  locked_until?: Date;

  @Column({ type: "timestamp", nullable: true })
  last_password_change?: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relationship with user profile table
  @OneToOne(() => User, { onDelete: "CASCADE" }) // When user is deleted, credentials are deleted too
  @JoinColumn({ name: "user_id" }) // Explicitly name the FK
  user!: User;
}
