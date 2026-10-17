package com.codesa.shop.controller;

import com.codesa.shop.dto.ProductPageResponse;
import com.codesa.shop.dto.ProductResponse;
import com.codesa.shop.service.ProductService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ProductPageResponse list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String order,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size
    ) {
        return productService.search(q, category, sort, order, page, size);
    }

    @GetMapping("/{id}")
    public ProductResponse detail(@PathVariable Long id) {
        return productService.findById(id);
    }
}
