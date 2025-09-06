import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, ManyToOne, JoinColumn } from "typeorm";
import { Role } from "./RoleModel";
import { Permission } from "./PermissionModel";
import { User } from "./UserModel";

@Entity()
export class Component {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100, unique: true })
  name!: string;

  @Column({ nullable: true })
  order!: number;

  @ManyToOne(() => User, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "created_by" })
  created_by?: User | null;

  // Many-to-many with roles
  @ManyToMany(() => Role, (role) => role.components, { cascade: false })
  @JoinTable({
    name: "component_roles", // join table
    joinColumn: { name: "component_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "role_id", referencedColumnName: "id" },
  })
  roles!: Role[];

  // Many-to-many with permissions
  @ManyToMany(() => Permission, (permission) => permission.components, { cascade: false })
  @JoinTable({
    name: "component_permissions", // join table
    joinColumn: { name: "component_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "permission_id", referencedColumnName: "id" },
  })
  permissions!: Permission[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
