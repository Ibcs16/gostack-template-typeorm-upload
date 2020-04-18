import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('categories')
class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ select: false })
  created_at: Date;

  @Column({ select: false })
  updated_at: Date;
}

export default Category;
