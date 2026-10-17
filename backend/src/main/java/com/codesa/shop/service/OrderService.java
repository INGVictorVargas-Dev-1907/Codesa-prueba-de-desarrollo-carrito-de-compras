package com.codesa.shop.service;

import com.codesa.shop.domain.Coupon;
import com.codesa.shop.domain.Order;
import com.codesa.shop.domain.OrderLine;
import com.codesa.shop.domain.Product;
import com.codesa.shop.dto.OrderLineResponse;
import com.codesa.shop.dto.OrderRequest;
import com.codesa.shop.dto.OrderResponse;
import com.codesa.shop.exception.ApiException;
import com.codesa.shop.repository.OrderRepository;
import com.codesa.shop.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private static final long FREE_SHIPPING_THRESHOLD = 200_000L;
    private static final long SHIPPING_COST = 12_900L;
    private static final int MAX_UNITS_PER_LINE = 10;

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CouponService couponService;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        CouponService couponService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.couponService = couponService;
    }

    @Transactional
    public OrderResponse create(OrderRequest request) {
        List<OrderLine> lines = new ArrayList<>();
        long subtotal = 0L;

        for (OrderRequest.OrderItem item : request.items()) {
            Product product = productRepository.findById(item.productId())
                    .orElseThrow(() -> new ApiException(
                            HttpStatus.NOT_FOUND,
                            "RECURSO_NO_ENCONTRADO",
                            "Producto no encontrado: " + item.productId()
                    ));

            if (item.quantity() > product.getStock()) {
                throw new ApiException(
                        HttpStatus.CONFLICT,
                        "STOCK_INSUFICIENTE",
                        "Stock insuficiente para: " + product.getName()
                                + " (disponible: " + product.getStock() + ")"
                );
            }

            if (item.quantity() > MAX_UNITS_PER_LINE) {
                throw new ApiException(
                        HttpStatus.UNPROCESSABLE_ENTITY,
                        "CANTIDAD_INVALIDA",
                        "Máximo " + MAX_UNITS_PER_LINE + " unidades por línea"
                );
            }

            OrderLine line = new OrderLine(product, item.quantity(), product.getPrice());
            lines.add(line);
            subtotal += product.getPrice() * item.quantity();
        }

        long discount = 0L;
        String couponCode = null;
        if (request.customer().couponCode() != null && !request.customer().couponCode().isBlank()) {
            Coupon coupon = couponService.findActive(request.customer().couponCode());

            if (subtotal < coupon.getMinSubtotal()) {
                throw new ApiException(
                        HttpStatus.UNPROCESSABLE_ENTITY,
                        "CUPON_MONTO_MINIMO",
                        "El cupón requiere un subtotal mínimo de $" + coupon.getMinSubtotal()
                );
            }
            long raw = subtotal * coupon.getPercent() / 100;
            discount = coupon.getMaxDiscount() != null
                    ? Math.min(raw, coupon.getMaxDiscount())
                    : raw;
            couponCode = coupon.getCode();
        }

        long shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0L : SHIPPING_COST;
        long total = subtotal - discount + shipping;

        Order order = new Order();
        order.setNumber(generateNumber());
        order.setCustomerFullName(request.customer().fullName());
        order.setCustomerEmail(request.customer().email());
        order.setCustomerPhone(request.customer().phone());
        order.setCustomerAddress(request.customer().address());
        order.setCustomerCity(request.customer().city());
        order.setPaymentMethod(request.customer().paymentMethod());
        order.setCouponCode(couponCode);
        order.setSubtotal(subtotal);
        order.setDiscount(discount);
        order.setShipping(shipping);
        order.setTotal(total);
        order.setStatus("PENDING");
        order.setCreatedAt(LocalDateTime.now());

        for (OrderLine line : lines) {
            order.addLine(line);
            // Descontar stock
            Product p = line.getProduct();
            p.setStock(p.getStock() - line.getQuantity());
            productRepository.save(p);
        }

        Order saved = orderRepository.save(order);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public OrderResponse findByNumber(String number) {
        Order order = orderRepository.findByNumberWithLines(number)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "RECURSO_NO_ENCONTRADO",
                        "Pedido no encontrado"
                ));
        return toResponse(order);
    }

    private String generateNumber() {
        long count = orderRepository.count() + 1;
        int year = LocalDateTime.now().getYear();
        return String.format("ORD-%d-%04d", year, count);
    }

    private OrderResponse toResponse(Order order) {
        List<OrderLineResponse> lineResponses = order.getLines().stream()
                .map(l -> new OrderLineResponse(
                        l.getProduct().getId(),
                        l.getProduct().getName(),
                        l.getProduct().getImage(),
                        l.getUnitPrice(),
                        l.getQuantity(),
                        l.getUnitPrice() * l.getQuantity()
                ))
                .toList();

        OrderResponse.CustomerResponse customerResponse = new OrderResponse.CustomerResponse(
                order.getCustomerFullName(),
                order.getCustomerEmail(),
                order.getCustomerPhone(),
                order.getCustomerAddress(),
                order.getCustomerCity(),
                order.getPaymentMethod()
        );

        return new OrderResponse(
                order.getId(),
                order.getNumber(),
                order.getCreatedAt(),
                order.getStatus(),
                customerResponse,
                order.getCouponCode(),
                lineResponses,
                order.getSubtotal(),
                order.getDiscount(),
                order.getShipping(),
                order.getTotal()
        );
    }
}
