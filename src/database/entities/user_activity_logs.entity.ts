import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity()
export class UserActivityLogs {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ default: null })
  method: string;

  @Column({ default: null, type: 'text' })
  original_url: string;

  @Column({ default: null })
  status_code: number;

  @Column({ default: null, type: 'text' })
  request_data: string;

  @Column({ default: null, type: 'text' })
  response_data: string;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    type: 'timestamp',
  })
  deletedAt: Date;
}
