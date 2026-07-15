package com.hetarth.expensetracker.specification;

import com.hetarth.expensetracker.entity.Transaction;
import com.hetarth.expensetracker.entity.User;
import com.hetarth.expensetracker.enums.PaymentMethod;
import com.hetarth.expensetracker.enums.TransactionType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Custom JPA Specifications for building dynamic MySQL queries on Transaction tables.
 * This pattern completely replaces verbose manual SQL generation by constructing
 * a JPA criteria tree representing filters that can be combined dynamically.
 */
public class TransactionSpecification {

    public static Specification<Transaction> getFilteredTransactions(
            User user,
            String search,
            TransactionType type,
            Long categoryId,
            PaymentMethod paymentMethod,
            LocalDate startDate,
            LocalDate endDate,
            BigDecimal minAmount,
            BigDecimal maxAmount
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Rule 0: CRITICAL - Always isolate data so users only query their own records!
            predicates.add(cb.equal(root.get("user"), user));

            // Rule 1: Search query matches transaction name, description, category name, or payment method
            if (search != null && !search.trim().isEmpty()) {
                String likePattern = "%" + search.trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), likePattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), likePattern);
                Predicate catMatch = cb.like(cb.lower(root.join("category").get("name")), likePattern);
                
                // Combine string criteria with OR
                predicates.add(cb.or(nameMatch, descMatch, catMatch));
            }

            // Rule 2: Transaction Type filter (INCOME or EXPENSE)
            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }

            // Rule 3: Category filter
            if (categoryId != null) {
                predicates.add(cb.equal(root.join("category").get("id"), categoryId));
            }

            // Rule 4: Payment Method filter
            if (paymentMethod != null) {
                predicates.add(cb.equal(root.get("paymentMethod"), paymentMethod));
            }

            // Rule 5: Date scope filters (startDate and endDate)
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("transactionDate"), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("transactionDate"), endDate));
            }

            // Rule 6: Amount range filters
            if (minAmount != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("amount"), minAmount));
            }
            if (maxAmount != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("amount"), maxAmount));
            }

            // Build full WHERE clause tree
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
