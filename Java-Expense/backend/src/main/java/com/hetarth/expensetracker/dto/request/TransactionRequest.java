package com.hetarth.expensetracker.dto.request;

import com.hetarth.expensetracker.enums.PaymentMethod;
import com.hetarth.expensetracker.enums.TransactionType;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class TransactionRequest {

    @NotBlank(message = "Transaction name is required")
    @Size(max = 100, message = "Transaction name must be less than 100 characters")
    private String name;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;

    @NotNull(message = "Transaction type is required")
    private TransactionType type;

    @NotNull(message = "Category identifier is required")
    private Long categoryId;

    @NotNull(message = "Transaction date is required")
    private LocalDate transactionDate;

    private String description;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;
}
