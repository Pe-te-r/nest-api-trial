import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm'

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  type: 'customer_payment' | 'payout_store' | 'payout_driver'

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number

  @Column({ nullable: true })
  fromAccountId: string

  @Column({ nullable: true })
  toAccountId: string

  @Column({ nullable: true })
  orderId: string

  @CreateDateColumn()
  createdAt: Date
}
