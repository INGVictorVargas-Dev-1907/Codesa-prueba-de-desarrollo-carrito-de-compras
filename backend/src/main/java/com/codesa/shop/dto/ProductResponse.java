package com.codesa.shop.dto;

public record ProductResponse(
        Long id,
        String name,
        String brand,
        String category,
        Long price,
        Integer stock,
        Double rating,
        String image,
        String description
) {
}
