const Transaction = require('../models/Transaction');
const logger = require('../utils/logger');

// @desc    Get all transactions for the logged-in user
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const { type, category, search } = req.query;
    
    // Create base query linked to user
    const query = { userId: req.user._id };

    // Apply type filter ('Income' or 'Expense')
    if (type && type !== 'All') {
      query.type = type;
    }

    // Apply category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Apply text search on title
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Fetch and sort transactions by date descending
    const transactions = await Transaction.find(query).sort({ date: -1 });
    
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
    const { title, amount, type, category, date, notes } = req.body;

    if (!title || amount === undefined || !type || !category || !date) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero' });
    }

    if (!['Income', 'Expense'].includes(type)) {
      return res.status(400).json({ message: 'Type must be Income or Expense' });
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      title,
      amount,
      type,
      category,
      date,
      notes,
    });

    logger.info('Transaction created', { 
      action: 'create_transaction', 
      userId: req.user._id, 
      transactionId: transaction._id, 
      type, 
      category, 
      amount 
    });

    res.status(201).json(transaction);
  } catch (error) {
    logger.error('Create Transaction Error', { error: error.message });
    res.status(500).json({ message: 'Server error creating transaction' });
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, date, notes } = req.body;
    
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Make sure transaction belongs to user
    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Apply updates
    transaction.title = title !== undefined ? title : transaction.title;
    transaction.amount = amount !== undefined ? amount : transaction.amount;
    transaction.type = type !== undefined ? type : transaction.type;
    transaction.category = category !== undefined ? category : transaction.category;
    transaction.date = date !== undefined ? date : transaction.date;
    transaction.notes = notes !== undefined ? notes : transaction.notes;

    // Validation checks
    if (transaction.amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero' });
    }

    if (!['Income', 'Expense'].includes(transaction.type)) {
      return res.status(400).json({ message: 'Type must be Income or Expense' });
    }

    const updatedTransaction = await transaction.save();
    
    logger.info('Transaction updated', { 
      action: 'update_transaction', 
      userId: req.user._id, 
      transactionId: updatedTransaction._id, 
      type: updatedTransaction.type, 
      category: updatedTransaction.category, 
      amount: updatedTransaction.amount 
    });

    res.json(updatedTransaction);
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
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Make sure transaction belongs to user
    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Remove transaction
    await Transaction.deleteOne({ _id: req.params.id });

    logger.info('Transaction deleted', { 
      action: 'delete_transaction', 
      userId: req.user._id, 
      transactionId: req.params.id 
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
