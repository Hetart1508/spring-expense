package com.hetarth.expensetracker.enums;

/**
 * Defines the main categories of transactions in the ledger.
 * This enum maps to both the Transaction entity and the Category metadata entity,
 * ensuring type uniformity across table associations.
 */
public enum TransactionType {
    INCOME,
    EXPENSE
}
