package com.hetarth.expensetracker.controller;

import com.hetarth.expensetracker.entity.Category;
import com.hetarth.expensetracker.enums.TransactionType;
import com.hetarth.expensetracker.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<Category>> getCategories(
            @RequestParam(value = "type", required = false) TransactionType type
    ) {
        if (type != null) {
            return ResponseEntity.ok(categoryService.getCategoriesByType(type));
        }
        return ResponseEntity.ok(categoryService.getAllCategories());
    }
}
