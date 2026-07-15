package com.hetarth.expensetracker.dto.response;

import com.hetarth.expensetracker.entity.Transaction;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryResponse {
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal balance;
    private long totalTransactionCount;
    private long incomeTransactionCount;
    private long expenseTransactionCount;
    
    private HighestCategoryInfo highestExpenseCategory;
    private HighestCategoryInfo highestIncomeCategory;
    
    private List<CategoryExpenseSummary> categoryWiseExpenses;
    private List<MonthlySummaryTrend> monthlySummary;
    private List<Transaction> recentTransactions;
}
