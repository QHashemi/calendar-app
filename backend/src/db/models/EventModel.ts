import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from "typeorm";
import { User } from "./UserModel";

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("timestamp")
  start!: Date;

  @Column("timestamp")
  end!: Date;

  @Column({ length: 100 })
  title!: string;

  @Column({ length: 20, nullable: true })
  color?: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "text", nullable: true })
  note?: string;

  @Column({ type: "text", nullable: true })
  location?: string;

  @Column({ default: false })
  is_all_day!: boolean; // <-- new field for all-day events

  @Column({ default: false })
  is_ms_event!: boolean; // <-- new field for all-day events

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;


 // NEW: createdBy field
  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @JoinColumn({ name: "created_by" })
  created_by!: User;

  // Relationship to User
  @ManyToOne(() => User, (user) => user.ownerEvents, { onDelete: "CASCADE" })
  @JoinColumn({ name: "owner_id" }) // changed column name
  owner!: User;

  @ManyToOne(() => User, (user) => user.organizerEvents, { onDelete: "CASCADE" })
  @JoinColumn({ name: "organizer_id" }) // changed column name
  organizer!: User;

  // Helpers relationship
  @ManyToMany(() => User)
  @JoinTable({
    name: "event_helpers", // name of the join table
    joinColumn: { name: "event_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "user_id", referencedColumnName: "id" },
  })
  helpers!: User[];
}
