import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('transaction_ledgers')
export class TransactionLedger {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  transactionId: string

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number

  @Column()
  direction: 'credit' | 'debit'

  @Column()
  accountId: string

  @CreateDateColumn()
  createdAt: Date
}
