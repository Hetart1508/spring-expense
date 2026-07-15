package com.hetarth.expensetracker.repository;

import com.hetarth.expensetracker.entity.Category;
import com.hetarth.expensetracker.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    // Derived query to filter predefined categories by their TransactionType (INCOME vs EXPENSE)
    List<Category> findByType(TransactionType type);
}
