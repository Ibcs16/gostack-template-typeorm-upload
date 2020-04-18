import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  // ManyToOne,
  // JoinColumn,
} from 'typeorm';
import Category from './Category';
// import Category from './Category';

@Entity('transactions')
class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  type: 'income' | 'outcome';

  @Column('numeric')
  value: number;

  @Column()
  category_id: string;

  @ManyToOne(() => Category, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ select: false })
  created_at: Date;

  @Column({ select: false })
  updated_at: Date;
}

export default Transaction;
