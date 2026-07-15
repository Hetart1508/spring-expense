package com.hetarth.expensetracker.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
public class MonthlySummaryTrend {
    private String month; // E.g. "2026-07"
    private BigDecimal income;
    private BigDecimal expense;
}
