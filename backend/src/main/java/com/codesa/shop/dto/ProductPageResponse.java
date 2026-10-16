package com.codesa.shop.dto;

import java.util.List;

public record ProductPageResponse(
        List<ProductResponse> items,
        long total,
        int page,
        int size,
        int totalPages
) {
}
