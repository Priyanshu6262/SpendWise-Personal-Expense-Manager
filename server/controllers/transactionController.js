const { Op } = require('sequelize');
const Transaction = require('../models/Transaction');
const logger = require('../utils/logger');

// @desc    Get all transactions for the logged-in user
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { type, category, search } = req.query;

    // Create base query linked to user
    const where = { userId };

    // Apply type filter ('Income' or 'Expense')
    if (type && type !== 'All') {
      where.type = type;
    }

    // Apply category filter
    if (category && category !== 'All') {
      where.category = category;
    }

    // Apply text search on title
    if (search && search.trim()) {
      where.title = {
        [Op.like]: `%${search.trim()}%`,
      };
    }

    // Fetch and sort transactions by date descending
    const transactions = await Transaction.findAll({
      where,
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
    });

    res.json(transactions);
  } catch (error) {
    logger.error('Get Transactions Error', { error: error.message });
    res.status(500).json({ message: 'Server error retrieving transactions' });
  }
};

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { title, amount, type, category, date, notes } = req.body;

    if (!title || amount === undefined || !type || !category || !date) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero' });
    }

    if (!['Income', 'Expense'].includes(type)) {
      return res.status(400).json({ message: 'Type must be Income or Expense' });
    }

    const transaction = await Transaction.create({
      userId,
      title: title.trim(),
      amount: parsedAmount,
      type,
      category,
      date: new Date(date),
      notes: notes || null,
    });

    logger.info('Transaction created', {
      action: 'create_transaction',
      userId,
      transactionId: transaction.id,
      type,
      category,
      amount: parsedAmount,
    });

    res.status(201).json(transaction);
  } catch (error) {
    logger.error('Create Transaction Error', { error: error.message });
    res.status(500).json({ message: error.message || 'Server error creating transaction' });
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { title, amount, type, category, date, notes } = req.body;

    const transaction = await Transaction.findByPk(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Make sure transaction belongs to user
    if (transaction.userId !== userId) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (amount !== undefined) {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ message: 'Amount must be greater than zero' });
      }
      updateData.amount = parsedAmount;
    }
    if (type !== undefined) {
      if (!['Income', 'Expense'].includes(type)) {
        return res.status(400).json({ message: 'Type must be Income or Expense' });
      }
      updateData.type = type;
    }
    if (category !== undefined) updateData.category = category;
    if (date !== undefined) updateData.date = new Date(date);
    if (notes !== undefined) updateData.notes = notes;

    await transaction.update(updateData);

    logger.info('Transaction updated', {
      action: 'update_transaction',
      userId,
      transactionId: transaction.id,
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
    });

    res.json(transaction);
  } catch (error) {
    logger.error('Update Transaction Error', { error: error.message });
    res.status(500).json({ message: 'Server error updating transaction' });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const transaction = await Transaction.findByPk(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Make sure transaction belongs to user
    if (transaction.userId !== userId) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Remove transaction
    await transaction.destroy();

    logger.info('Transaction deleted', {
      action: 'delete_transaction',
      userId,
      transactionId: req.params.id,
    });

    res.json({ message: 'Transaction removed' });
  } catch (error) {
    logger.error('Delete Transaction Error', { error: error.message });
    res.status(500).json({ message: 'Server error deleting transaction' });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
