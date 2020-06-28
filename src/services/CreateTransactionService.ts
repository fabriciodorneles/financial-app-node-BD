// import AppError from '../errors/AppError';

import { getRepository, getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface Request {
  title: string;

  type: 'income' | 'outcome';

  value: number;

  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    if (type === 'outcome') {
      const actualBalance = await transactionsRepository.getBalance();
      const futureBalance = actualBalance.total - value;

      if (futureBalance < 0) {
        throw new AppError('The Value will be negative.', 400);
      }
    }
    let categoryChecked = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!categoryChecked) {
      categoryChecked = categoriesRepository.create({
        title: category,
      });
      await categoriesRepository.save(categoryChecked);
    }
    const category_id = categoryChecked.id;

    const newTransaction = transactionsRepository.create({
      title,
      type,
      value,
      category_id,
    });

    await transactionsRepository.save(newTransaction);

    return newTransaction;
  }
}

export default CreateTransactionService;
