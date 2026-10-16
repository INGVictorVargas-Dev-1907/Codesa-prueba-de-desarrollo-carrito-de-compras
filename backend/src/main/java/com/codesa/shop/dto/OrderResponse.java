package com.codesa.shop.dto;

import java.time.LocalDateTime;

public record OrderResponse(
        Long id,
        String number,
        LocalDateTime createdAt,
        String status,
        CustomerResponse customer,
        String couponCode,
        List<OrderLineResponse> lines,
        Long subtotal,
        Long discount,
        Long shipping,
        Long total
) {

    public record CustomerResponse(
            String fullName,
            String email,
            String phone,
            String address,
            String city,
            String paymentMethod
    ) {
    }
}
