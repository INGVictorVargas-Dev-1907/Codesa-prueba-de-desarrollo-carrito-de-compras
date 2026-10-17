package com.codesa.shop.service;

import com.codesa.shop.domain.Coupon;
import com.codesa.shop.dto.CouponResponse;
import com.codesa.shop.exception.ApiException;
import com.codesa.shop.repository.CouponRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    @Transactional(readOnly = true)
    public CouponResponse validate(String code) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new ApiException(
                        HttpStatus.UNPROCESSABLE_ENTITY,
                        "CUPON_INVALIDO",
                        "El cupón no existe"
                ));

        if (coupon.getExpiresAt() !=null && coupon.getExpiresAt().isBefore(LocalDate.now())) {
            throw new ApiException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "CUPON_VENCIDO",
                    "El cupón ya no está vigente"
            );
        }

        return new CouponResponse(
                coupon.getCode(),
                coupon.getPercent(),
                coupon.getMinSubtotal(),
                coupon.getMaxDiscount(),
                false
        );
    }

    @Transactional(readOnly = true)
    public Coupon findActive(String code) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new ApiException(
                        HttpStatus.UNPROCESSABLE_ENTITY,
                        "CUPON_INVALIDO",
                        "El cupón no existe"
                ));

        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(LocalDate.now())) {
            throw new ApiException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "CUPON_VENCIDO",
                    "El cupón ya no está vigente"
            );
        }

        return coupon;
    }
}
