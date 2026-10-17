package com.codesa.shop.controller;

import com.codesa.shop.dto.CouponResponse;
import com.codesa.shop.service.CouponService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @GetMapping("/{code}")
    public CouponResponse validate(@PathVariable String code) {
        return couponService.validate(code);
    }
}
