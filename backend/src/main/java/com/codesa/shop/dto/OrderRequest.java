package com.codesa.shop.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;

public record OrderRequest(
        @Valid CustomerData customer,
        @NotEmpty List<@Valid OrderItem> items
        ) {

    public record CustomerData(
            @NotBlank @Size(max = 200) String fullName,
            @NotBlank @Email @Size(max = 200) String email,
            @NotBlank @Pattern(regexp = "\\d{7,10}") String phone,
            @NotBlank @Size(max = 300) String address,
            @NotBlank @Size(max = 100) String city,
            @NotBlank @Pattern(regexp = "CARD|CASH") String paymentMethod,
            String couponCode
    ) {
    }

    public record OrderItem(
            @NotNull Long productId,
            @NotNull @Min(1) @Max(10) Integer quantity
    ) {
    }
}
