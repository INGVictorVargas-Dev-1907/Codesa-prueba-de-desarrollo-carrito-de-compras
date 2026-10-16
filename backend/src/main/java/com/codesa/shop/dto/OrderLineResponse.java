package com.codesa.shop.dto;

public record OrderLineResponse(
        Long productId,
        String productName,
        String productImage,
        Long unitPrice,
        Integer quantity,
        Long lineSubtotal
) {
}
