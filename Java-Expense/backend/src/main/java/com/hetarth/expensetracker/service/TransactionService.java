package com.hetarth.expensetracker.service;

import com.hetarth.expensetracker.dto.request.TransactionRequest;
import com.hetarth.expensetracker.dto.response.PaginatedTransactionsResponse;
import com.hetarth.expensetracker.entity.Category;
import com.hetarth.expensetracker.entity.Transaction;
import com.hetarth.expensetracker.entity.User;
import com.hetarth.expensetracker.enums.PaymentMethod;
import com.hetarth.expensetracker.enums.TransactionType;
import com.hetarth.expensetracker.exception.CategoryTypeMismatchException;
import com.hetarth.expensetracker.exception.ResourceNotFoundException;
import com.hetarth.expensetracker.repository.CategoryRepository;
import com.hetarth.expensetracker.repository.TransactionRepository;
import com.hetarth.expensetracker.specification.TransactionSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Handles core business operations on transaction ledger records.
 */
@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    // Allowed sort parameters. Restricting prevents malicious queries or unknown JPA column crashes
    private final List<String> whitelistSortFields = List.of("transactionDate", "amount", "name", "id");

    @Transactional
    public Transaction createTransaction(User user, TransactionRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found."));

        if (category.getType() != request.getType()) {
            throw new CategoryTypeMismatchException(
                    "Selected category type (" + category.getType() + ") does not match transaction type (" + request.getType() + ")"
            );
        }

        Transaction transaction = Transaction.builder()
                .name(request.getName())
                .amount(request.getAmount())
                .type(request.getType())
                .category(category)
                .transactionDate(request.getTransactionDate())
                .description(request.getDescription())
                .paymentMethod(request.getPaymentMethod())
                .user(user)
                .build();

        return transactionRepository.save(transaction);
    }

    public PaginatedTransactionsResponse getTransactions(
            User user,
            int page,
            int size,
            String sortBy,
            String sortDirection,
            String search,
            TransactionType type,
            Long categoryId,
            PaymentMethod paymentMethod,
            LocalDate startDate,
            LocalDate endDate,
            BigDecimal minAmount,
            BigDecimal maxAmount
    ) {
        // Enforce safe sort fields
        String verifiedSortBy = whitelistSortFields.contains(sortBy) ? sortBy : "transactionDate";
        Sort.Direction dir = "asc".equalsIgnoreCase(sortDirection) ? Sort.Direction.ASC : Sort.Direction.DESC;
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, verifiedSortBy));

        // Dynamically build filtering criteria using JPA Specifications
        Specification<Transaction> spec = TransactionSpecification.getFilteredTransactions(
                user, search, type, categoryId, paymentMethod, startDate, endDate, minAmount, maxAmount
        );

        Page<Transaction> pageResult = transactionRepository.findAll(spec, pageable);

        return PaginatedTransactionsResponse.builder()
                .content(pageResult.getContent())
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .first(pageResult.isFirst())
                .last(pageResult.isLast())
                .sortBy(verifiedSortBy)
                .sortDirection(sortDirection.toLowerCase())
                .build();
    }

    public Transaction getTransactionById(User user, Long id) {
        return transactionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found or access is forbidden for ID: " + id));
    }

    @Transactional
    public Transaction updateTransaction(User user, Long id, TransactionRequest request) {
        Transaction transaction = getTransactionById(user, id);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found."));

        // Re-validate category type compatibility on updates
        if (category.getType() != request.getType()) {
            throw new CategoryTypeMismatchException(
                    "Selected category type (" + category.getType() + ") does not match transaction type (" + request.getType() + ")"
            );
        }

        transaction.setName(request.getName());
        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setCategory(category);
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setDescription(request.getDescription());
        transaction.setPaymentMethod(request.getPaymentMethod());

        return transactionRepository.save(transaction);
    }

    @Transactional
    public void deleteTransaction(User user, Long id) {
        Transaction transaction = getTransactionById(user, id);
        transactionRepository.delete(transaction);
    }
}
