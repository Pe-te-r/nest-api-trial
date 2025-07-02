import { AuthSession } from 'src/auth/entities/auth.entity'
import { AccountStatus, UserRole } from 'src/utils/enums'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  OneToOne,
} from 'typeorm'

@Entity('users')
@Unique(['email'])
@Unique(['phone'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 100, nullable: false, unique: false })
  first_name: string

  @Column({ type: 'varchar', length: 100, nullable: true, unique: false })
  last_name: string

  @Column({ type: 'varchar', length: 150, nullable: false, unique: true })
  email: string

  @Column({ type: 'varchar', length: 15, unique: true })
  phone: string

  @Column({ type: 'text', nullable: false })
  password_hash: string

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole

  @Column({ type: 'boolean', default: false })
  is_verified: boolean

  @Column({ type: 'enum', enum: AccountStatus, default: AccountStatus.ACTIVE })
  account_status: AccountStatus

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

  @OneToOne(() => AuthSession, (session) => session.user)
  session: AuthSession
}
