import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import neatCsv from 'neat-csv';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import Transaction from '../models/Transaction';
import updateConfig from '../config/updateConfig';
// import TransactionsRepository from '../repositories/TransactionsRepository';
// import CreateTransactionService from '../services/CreateTransactionService';
// import DeleteTransactionService from '../services/DeleteTransactionService';
// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

const upload = multer(updateConfig);

interface CsvRequest {
  title: string;
  value: number;
  category: string;
  type: 'outcome' | 'income';
}

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionsRepository.find({
    select: ['id', 'title', 'value', 'type'],
    relations: ['category'],
  });
  const balance = await transactionsRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const transactionsRepository = getCustomRepository(TransactionsRepository);

  await transactionsRepository.delete(id);

  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const transactions: Transaction[] = [];
    const createTransaction = new CreateTransactionService();

    const filePath = path.join(updateConfig.directory, request.file.filename);

    const data = await fs.promises.readFile(filePath);
    const arrayData = (await neatCsv(data, {
      headers: ['title', 'type', 'value', 'category'],
    })) as CsvRequest[];

    arrayData.splice(0, 1);

    arrayData.forEach(async item => {
      const type = item.type.trim() as 'income' | 'outcome';
      const value = Number(item.value);

      try {
        const transaction = await createTransaction.execute({
          ...item,
          type,
          value,
        });

        transactions.push(transaction);
      } catch (err) {
        console.error(err);
      }
    });

    return response.json(transactions);
  },
);

export default transactionsRouter;
