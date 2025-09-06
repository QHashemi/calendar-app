import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Role } from "./RoleModel";
import { Component } from "./ComponentModel";
import { User } from "./UserModel";

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @JoinColumn({ name: "created_by" })
  created_by!: User;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles!: Role[];

  @ManyToMany(() => Component, (component) => component.permissions)
  components!: Component[];

  // Many-to-many with Users (extra permissions per user)
  @ManyToMany(() => User, (user) => user.extra_permissions)
  users!: User[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
