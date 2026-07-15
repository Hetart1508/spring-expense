package com.hetarth.expensetracker.repository;

import com.hetarth.expensetracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for database queries on User entities.
 * Demonstrates Spring Data JPA's derived query methods.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Spring Data JPA automatically generates the SQL select query based on this method name
    Optional<User> findByName(String name);

    boolean existsByName(String name);
}
