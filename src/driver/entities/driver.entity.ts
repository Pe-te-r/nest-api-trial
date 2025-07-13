import { User } from 'src/users/entities/user.entity'
import { DriverStatus, VehicleType } from 'src/utils/enums'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm'

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @OneToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User

  // Simplified location simulation
  @Column({ type: 'varchar', length: 50, default: 'zone_1' })
  current_zone: string

  @Column({ type: 'enum', enum: DriverStatus, default: DriverStatus.OFFLINE })
  status: DriverStatus

  @Column({ type: 'enum', enum: VehicleType, nullable: false })
  vehicle_type: VehicleType

  @Column({ type: 'varchar', length: 20, nullable: false })
  license_plate: string

  // Simulation-specific fields
  @Column({ type: 'boolean', default: true })
  is_active: boolean

  @Column({ type: 'int', default: 0 })
  simulation_speed: number // 0-10 for mock movement speed

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}
