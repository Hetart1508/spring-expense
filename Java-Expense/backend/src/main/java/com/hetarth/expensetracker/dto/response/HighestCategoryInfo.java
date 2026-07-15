package com.hetarth.expensetracker.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
public class HighestCategoryInfo {
    private String categoryName;
    private BigDecimal amount;
}
