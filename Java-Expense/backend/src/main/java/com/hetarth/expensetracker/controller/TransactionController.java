package com.hetarth.expensetracker.controller;

import com.hetarth.expensetracker.dto.request.TransactionRequest;
import com.hetarth.expensetracker.dto.response.PaginatedTransactionsResponse;
import com.hetarth.expensetracker.entity.Transaction;
import com.hetarth.expensetracker.entity.User;
import com.hetarth.expensetracker.enums.PaymentMethod;
import com.hetarth.expensetracker.enums.TransactionType;
import com.hetarth.expensetracker.service.AuthService;
import com.hetarth.expensetracker.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private AuthService authService;

    // Helper to resolve User context from Principal credentials securely
    private User resolveUser(Principal principal) {
        return authService.getCurrentUser(principal.getName());
    }

    // 1. GET ALL: Paginated, sorted, and filtered lists
    @GetMapping
    public ResponseEntity<PaginatedTransactionsResponse> getTransactions(
            Principal principal,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "transactionDate") String sortBy,
            @RequestParam(value = "sortDirection", defaultValue = "desc") String sortDirection,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "type", required = false) TransactionType type,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "paymentMethod", required = false) PaymentMethod paymentMethod,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(value = "minAmount", required = false) BigDecimal minAmount,
            @RequestParam(value = "maxAmount", required = false) BigDecimal maxAmount
    ) {
        User user = resolveUser(principal);
        
        PaginatedTransactionsResponse result = transactionService.getTransactions(
                user, page, size, sortBy, sortDirection, search, type, categoryId, paymentMethod, startDate, endDate, minAmount, maxAmount
        );
        
        return ResponseEntity.ok(result);
    }

    // 2. GET SINGLE record details
    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(Principal principal, @PathVariable("id") Long id) {
        User user = resolveUser(principal);
        Transaction transaction = transactionService.getTransactionById(user, id);
        return ResponseEntity.ok(transaction);
    }

    // 3. CREATE transaction
    @PostMapping
    public ResponseEntity<Transaction> createTransaction(
            Principal principal,
            @Valid @RequestBody TransactionRequest request
    ) {
        User user = resolveUser(principal);
        Transaction transaction = transactionService.createTransaction(user, request);
        return new ResponseEntity<>(transaction, HttpStatus.CREATED);
    }

    // 4. UPDATE transaction
    @PutMapping("/{id}")
    public ResponseEntity<Transaction> updateTransaction(
            Principal principal,
            @PathVariable("id") Long id,
            @Valid @RequestBody TransactionRequest request
    ) {
        User user = resolveUser(principal);
        Transaction updated = transactionService.updateTransaction(user, id, request);
        return ResponseEntity.ok(updated);
    }

    // 5. DELETE transaction
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTransaction(Principal principal, @PathVariable("id") Long id) {
        User user = resolveUser(principal);
        transactionService.deleteTransaction(user, id);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Transaction deleted successfully.");
        
        return ResponseEntity.ok(response);
    }
}
