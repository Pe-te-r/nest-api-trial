import { User } from 'src/user/entities/user.entity'
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm'

@Entity('auth_sessions')
export class AuthSession {
  @PrimaryColumn('uuid')
  userId: string

  @Column({ type: 'varchar', nullable: false })
  refresh_token: string

  @Column({ type: 'varchar', nullable: true })
  ip_address: string

  @Column({ type: 'varchar', nullable: false })
  random_code: string

  @Column({ type: 'varchar', nullable: true })
  otp_code: string

  @Column({ type: 'boolean', default: false })
  otp_enabled: boolean

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User
}
