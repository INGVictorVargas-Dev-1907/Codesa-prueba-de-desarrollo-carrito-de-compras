package com.codesa.shop.repository;


import com.codesa.shop.domain.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor {
    // Usamos JpaSpecificationExecutor para poder filtrar por nombre, categoría, ordenar, y
    // paginar de forma dinámica. Todo se resuelve en la base de datos
}
