package com.codesa.shop.controller;

import com.codesa.shop.dto.OrderRequest;
import com.codesa.shop.dto.OrderResponse;
import com.codesa.shop.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> create(@Valid @RequestBody OrderRequest request) {
        OrderResponse response = orderService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{number}")
    public OrderResponse findByNumber (@PathVariable String number) {
        return orderService.findByNumber(number);
    }
}
