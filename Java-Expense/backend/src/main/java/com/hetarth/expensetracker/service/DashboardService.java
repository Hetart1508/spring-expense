package com.hetarth.expensetracker.service;

import com.hetarth.expensetracker.dto.response.*;
import com.hetarth.expensetracker.entity.Transaction;
import com.hetarth.expensetracker.entity.User;
import com.hetarth.expensetracker.enums.TransactionType;
import com.hetarth.expensetracker.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service that compiles multi-table reports and metrics into a single Dashboard payload.
 */
@Service
public class DashboardService {

    @Autowired
    private TransactionRepository transactionRepository;

    public DashboardSummaryResponse getDashboardSummary(User user, LocalDate startDate, LocalDate endDate) {
        
        // 1. Compute total sums
        BigDecimal totalIncome = transactionRepository.sumAmountByUserAndTypeAndDates(user, TransactionType.INCOME, startDate, endDate);
        BigDecimal totalExpense = transactionRepository.sumAmountByUserAndTypeAndDates(user, TransactionType.EXPENSE, startDate, endDate);
        BigDecimal balance = totalIncome.subtract(totalExpense);

        // 2. Count total records
        long incomeCount = transactionRepository.countByUserAndTypeAndDates(user, TransactionType.INCOME, startDate, endDate);
        long expenseCount = transactionRepository.countByUserAndTypeAndDates(user, TransactionType.EXPENSE, startDate, endDate);
        long totalCount = incomeCount + expenseCount;

        // 3. Fetch category breakdown list
        List<Object[]> rawExpenses = transactionRepository.sumExpenseByCategory(user, startDate, endDate);
        List<CategoryExpenseSummary> categoryWiseExpenses = rawExpenses.stream()
                .map(row -> new CategoryExpenseSummary((String) row[0], (BigDecimal) row[1]))
                .collect(Collectors.toList());

        List<Object[]> rawIncomes = transactionRepository.sumIncomeByCategory(user, startDate, endDate);

        // 4. Determine Peak Categories
        HighestCategoryInfo highestExpense = null;
        if (!categoryWiseExpenses.isEmpty()) {
            highestExpense = new HighestCategoryInfo(
                    categoryWiseExpenses.get(0).getCategoryName(),
                    categoryWiseExpenses.get(0).getAmount()
            );
        }

        HighestCategoryInfo highestIncome = null;
        if (!rawIncomes.isEmpty()) {
            highestIncome = new HighestCategoryInfo(
                    (String) rawIncomes.get(0)[0],
                    (BigDecimal) rawIncomes.get(0)[1]
            );
        }

        // 5. Build recent transactions (limit to 5)
        List<Transaction> recent = transactionRepository.findRecentTransactions(user, startDate, endDate, PageRequest.of(0, 5));

        // 6. Generate month-wise trend line (simulates real timeline groupings)
        List<MonthlySummaryTrend> monthlySummary = generateMonthlyTrends(user, startDate, endDate);

        return DashboardSummaryResponse.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .balance(balance)
                .totalTransactionCount(totalCount)
                .incomeTransactionCount(incomeCount)
                .expenseTransactionCount(expenseCount)
                .highestExpenseCategory(highestExpense)
                .highestIncomeCategory(highestIncome)
                .categoryWiseExpenses(categoryWiseExpenses)
                .monthlySummary(monthlySummary)
                .recentTransactions(recent)
                .build();
    }

    // Helper to bucket transactions by month for trend charts
    private List<MonthlySummaryTrend> generateMonthlyTrends(User user, LocalDate startDate, LocalDate endDate) {
        // Fallback to trailing 6 months if scope parameters are empty
        LocalDate end = (endDate != null) ? endDate : LocalDate.now();
        LocalDate start = (startDate != null) ? startDate : end.minusMonths(5).withDayOfMonth(1);

        List<Transaction> list = transactionRepository.findRecentTransactions(user, start, end, PageRequest.of(0, 1000));
        
        // Group by Year-Month string (e.g. "2026-07")
        Map<String, BigDecimal> incomeGroup = new HashMap<>();
        Map<String, BigDecimal> expenseGroup = new HashMap<>();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");

        for (Transaction t : list) {
            String yyyymm = t.getTransactionDate().format(formatter);
            if (t.getType() == TransactionType.INCOME) {
                incomeGroup.put(yyyymm, incomeGroup.getOrDefault(yyyymm, BigDecimal.ZERO).add(t.getAmount()));
            } else {
                expenseGroup.put(yyyymm, expenseGroup.getOrDefault(yyyymm, BigDecimal.ZERO).add(t.getAmount()));
            }
        }

        // Build continuous sorted list of months in the timeline
        List<MonthlySummaryTrend> trends = new ArrayList<>();
        LocalDate runner = start.withDayOfMonth(1);
        while (!runner.isAfter(end)) {
            String monthKey = runner.format(formatter);
            BigDecimal inc = incomeGroup.getOrDefault(monthKey, BigDecimal.ZERO);
            BigDecimal exp = expenseGroup.getOrDefault(monthKey, BigDecimal.ZERO);
            trends.add(new MonthlySummaryTrend(monthKey, inc, exp));
            runner = runner.plusMonths(1);
        }

        return trends;
    }
}
