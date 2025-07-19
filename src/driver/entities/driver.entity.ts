import { Assignment } from 'src/assignment/entities/assignment.entity'
import { DriverStatus, VehicleType } from 'src/types/types'
import { User } from 'src/user/entities/user.entity'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm'

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @OneToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column({ type: 'enum', enum: DriverStatus, default: DriverStatus.OFFLINE })
  status: DriverStatus

  @Column({ type: 'enum', enum: VehicleType, default: VehicleType.TRUCK, nullable: false })
  vehicle_type: VehicleType

  @Column({ type: 'varchar', length: 20, nullable: false })
  license_plate: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @OneToMany(() => Assignment, (assignment) => assignment.driver)
  assignments: Assignment[]
}
