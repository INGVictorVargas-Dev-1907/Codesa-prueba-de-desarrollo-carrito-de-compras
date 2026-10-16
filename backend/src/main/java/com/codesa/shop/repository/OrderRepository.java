package com.codesa.shop.repository;

import com.codesa.shop.domain.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.lines l LEFT JOIN FETCH l.product WHERE o.number = :number")
    Optional<Order>findByNumberWithLines(@Param("number") String number);
}
