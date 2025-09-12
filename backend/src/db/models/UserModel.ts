import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable, ManyToOne, JoinColumn } from "typeorm";
import { Event } from "./EventModel";
import { Role } from "./RoleModel";
import { Permission } from "./PermissionModel";

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50 })
  first_name!: string;

  @Column({ length: 50 })
  last_name!: string;

  @Column({ length: 100, nullable: true })
  display_name!: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ length: 20, nullable: true })
  color?: string;

  @Column({ unique: true })
  email!: string;

  @Column({ length: 50, nullable: true })
  gender?: string;

  @Column({ length: 100, nullable: true })
  title?: string;

  @Column({ length: 100, nullable: true })
  job?: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ length: 100, nullable: true })
  mobile_phone?: string;

  @Column({ length: 100, nullable: true })
  phone?: string;

  @Column({ length: 100, nullable: true })
  website?: string;

  @Column({ default: false })
  has_personal_calendar!: boolean; // <-- new field for all-day events

  @Column({ nullable: true })
  sort_order?: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relationship to EVENTs
  @OneToMany(() => Event, (event) => event.owner)
  ownerEvents!: Event[];

  @OneToMany(() => Event, (event) => event.organizer)
  organizerEvents!: Event[];

  @ManyToMany(() => Event, (event) => event.helpers)
  helperEvents!: Event[];

  // User Roles
  @ManyToMany(() => Role, (role) => role.users, { cascade: true })
  @JoinTable({
    name: "user_roles",
    joinColumn: { name: "user_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "role_id", referencedColumnName: "id" },
  })
  roles!: Role[];

  // Extra permissions directly assigned to user
  @ManyToMany(() => Permission, (permission) => permission.users, { cascade: true })
  @JoinTable({
    name: "user_permissions",
    joinColumn: { name: "user_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "permission_id", referencedColumnName: "id" },
  })
  extra_permissions!: Permission[];
}
