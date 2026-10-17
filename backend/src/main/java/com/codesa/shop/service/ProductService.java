package com.codesa.shop.service;

import com.codesa.shop.domain.Product;
import com.codesa.shop.dto.ProductPageResponse;
import com.codesa.shop.dto.ProductResponse;
import com.codesa.shop.exception.ApiException;
import com.codesa.shop.repository.ProductRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public ProductPageResponse search(String q, String category, String sort, String order,
                                      int page, int size) {
        Specification<Product> spec = buildSpecification(q, category);
        Pageable pageable = buildPageable(sort, order, page, size);

        Page<Product> result = productRepository.findAll(spec, pageable);

        return new ProductPageResponse(
                result.getContent().stream().map(this::toResponse).toList(),
                result.getTotalElements(),
                result.getNumber(),
                result.getSize(),
                result.getTotalPages()
        );
    }

    public ProductResponse findById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "RECURSO_NO_ENCONTRADO",
                        "Producto no encontrado"
                ));
        return toResponse(product);
    }

    private Specification<Product> buildSpecification(String q, String category) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (q != null && !q.isBlank()) {
                String pattern = "%" + q.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("brand")), pattern)
                ));
            }

            if (category != null && !category.isBlank()) {
                predicates.add(cb.equal(root.get("category").get("name"), category));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Pageable buildPageable(String sort, String order, int page, int size) {
        String field = (sort == null || sort.isBlank()) ? "id" : sort;
        Sort.Direction direction = "desc".equalsIgnoreCase(order)
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
        return PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50),
                Sort.by(direction, field));
    }

    private ProductResponse toResponse(Product p) {
        return new ProductResponse(
                p.getId(),
                p.getName(),
                p.getBrand(),
                p.getCategory().getName(),
                p.getPrice(),
                p.getStock(),
                p.getRating(),
                p.getImage(),
                p.getDescription()
        );
    }
}
