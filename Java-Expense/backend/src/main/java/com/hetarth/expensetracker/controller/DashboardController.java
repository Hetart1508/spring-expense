package com.hetarth.expensetracker.controller;

import com.hetarth.expensetracker.dto.response.DashboardSummaryResponse;
import com.hetarth.expensetracker.entity.User;
import com.hetarth.expensetracker.service.AuthService;
import com.hetarth.expensetracker.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private AuthService authService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getSummary(
            Principal principal,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        User user = authService.getCurrentUser(principal.getName());
        DashboardSummaryResponse summary = dashboardService.getDashboardSummary(user, startDate, endDate);
        return ResponseEntity.ok(summary);
    }
}
