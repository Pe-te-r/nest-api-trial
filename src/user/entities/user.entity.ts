import { AuthSession } from 'src/auth/entities/auth.entity'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  OneToOne,
} from 'typeorm'

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  VENDOR = 'vendor',
  DELIVERY = 'delivery',
}

@Entity('users')
@Unique(['email'])
@Unique(['phone'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 100, nullable: false, unique: false })
  username: string

  @Column({ type: 'varchar', length: 150, nullable: false, unique: true })
  email: string

  @Column({ type: 'varchar', length: 15 })
  phone: string

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole

  @Column({ type: 'boolean', default: false })
  is_verified: boolean

  @Column({ type: 'text', nullable: false })
  password_hash: string

  @Column({ type: 'bool', default: false })
  is_blockerd: boolean

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
