import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const income = this.sumValuesByType(transactions, 'income');

    const outcome = this.sumValuesByType(transactions, 'outcome');

    const balance = {
      income,
      outcome,
      total: income - outcome,
    } as Balance;

    return balance;
  }

  private sumValuesByType(
    transactions: Transaction[],
    typeToFilter: string,
  ): number {
    // Filtra pelo tipo, retorna apenas valores, e soma
    return transactions
      .filter(item => item.type === typeToFilter)
      .map(item => Number(item.value))
      .reduce((a, b) => a + b, 0);
  }
}

export default TransactionsRepository;
