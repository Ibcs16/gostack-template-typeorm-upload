// import AppError from '../errors/AppError';

import { getCustomRepository, getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';
import Category from '../models/Category';
// import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  category: string;
  type: 'outcome' | 'income';
}

class CreateTransactionService {
  public async execute({
    type,
    value,
    title,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && balance.total - value < 0) {
      throw new AppError('Insuficient funds');
    }

    const categoriesRepository = getRepository(Category);

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
    });

    const checkIfCategoryExists = await categoriesRepository.findOne({
      where: {
        title: category,
      },
    });

    let categoryId = null;

    if (checkIfCategoryExists) {
      categoryId = checkIfCategoryExists.id;
    } else {
      const newCategory = await categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(newCategory);

      categoryId = newCategory.id;
    }

    transaction.category_id = categoryId;

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
