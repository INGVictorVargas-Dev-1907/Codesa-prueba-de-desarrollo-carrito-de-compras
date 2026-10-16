package com.codesa.shop.dto;

public record CouponResponse(
        String code,
        Integer percent,
        Long minSubtotal,
        Long maxDiscount,
        boolean expired
) {
}
