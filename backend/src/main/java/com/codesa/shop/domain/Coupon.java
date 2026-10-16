package com.codesa.shop.domain;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "coupons")
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false)
    private Integer percent;

    @Column(name = "min_subtotal", nullable = false)
    private Long minSubtotal;

    @Column(name = "max_discount")
    private Long maxDiscount;

    @Column(name = "expires_at")
    private LocalDate expiresAt;

    public Coupon() {

    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Integer getPercent() {
        return percent;
    }

    public void setPercent(Integer percent) {
        this.percent = percent;
    }

    public Long getMinSubtotal() {
        return minSubtotal;
    }

    public void setMinSubtotal(Long minSubtotal) {
        this.minSubtotal = minSubtotal;
    }

    public Long getMaxDiscount() {
        return maxDiscount;
    }

    public void setMaxDiscount(Long maxDiscount) {
        this.maxDiscount = maxDiscount;
    }

    public LocalDate getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDate expiresAt) {
        this.expiresAt = expiresAt;
    }
}
