package com.codesa.shop.config;

import com.codesa.shop.domain.Category;
import com.codesa.shop.domain.Coupon;
import com.codesa.shop.domain.Product;
import com.codesa.shop.repository.CategoryRepository;
import com.codesa.shop.repository.CouponRepository;
import com.codesa.shop.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;


@Component
public class DataSeeder  implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;

    private DataSeeder(CategoryRepository categoryRepository,
                       ProductRepository productRepository,
                       CouponRepository couponRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.couponRepository = couponRepository;
    }

    @Override
    public void run(String... args) {
        if (categoryRepository.count() > 0) {
            log.info("DataSeeder: catálogo ya existe, se omite el sembrado.");
            return;
        }

        log.info("DataSeeder: sembrando catálogo inicial...");
        seedCategories();
        seedProducts();
        seedCoupons();
        log.info("DataSeeder: catálogo sembrado correctamente.");
    }

    private void seedCategories() {
        List<String> names = List.of("Audio", "Periféricos", "Cómputo", "Celulares");
        for (String name : names) {
            Category category = new Category(name);
            categoryRepository.save(category);
        }
    }

    private void seedProducts() {
        Category audio = categoryRepository.findByName("Audio").orElseThrow();
        Category perifericos = categoryRepository.findByName("Periféricos").orElseThrow();
        Category computo = categoryRepository.findByName("Cómputo").orElseThrow();
        Category celulares = categoryRepository.findByName("Celulares").orElseThrow();

        productRepository.saveAll(List.of(
                // ============ AUDIO (3 productos) ============
                product("Audífonos in-ear con cancelación de ruido", "Sonik", audio,
                        189900L, 8, 4.5,
                        "https://picsum.photos/seed/audio-1/600/450",
                        "Audífonos in-ear con cancelación activa de ruido, hasta 24 horas de batería y estuche de carga. Ideales para viajes y trabajo."),

                product("Parlante Bluetooth portátil", "BoomBox", audio,
                        249900L, 5, 4.3,
                        "https://picsum.photos/seed/audio-2/600/450",
                        "Parlante Bluetooth resistente al agua con 20W de potencia, batería de 12 horas y entrada auxiliar."),

                product("Audífonos over-ear studio", "AudioPro", audio,
                        599900L, 3, 4.8,
                        "https://picsum.photos/seed/audio-3/600/450",
                        "Audífonos profesionales over-ear con drivers de 50mm, ideal para producción musical y monitoreo."),

                // ============ PERIFÉRICOS (3 productos) ============
                product("Teclado mecánico RGB", "KeyMaster", perifericos,
                        329900L, 10, 4.6,
                        "https://picsum.photos/seed/peri-1/600/450",
                        "Teclado mecánico con switches táctiles, retroiluminación RGB personalizable y reposamuñecas magnético."),

                product("Mouse gamer inalámbrico", "SwiftClick", perifericos,
                        179900L, 2, 4.4,
                        "https://picsum.photos/seed/peri-2/600/450",
                        "Mouse inalámbrico con sensor de 16000 DPI, 8 botones programables y batería de 70 horas. Stock limitado."),

                product("Diadema gaming con micrófono", "HyperSound", perifericos,
                        219900L, 6, 4.2,
                        "https://picsum.photos/seed/peri-3/600/450",
                        "Diadema gaming 7.1 con micrófono con cancelación de ruido y almohadillas de memory foam."),

                // ============ CÓMPUTO (3 productos) ============
                product("Laptop ultraligera 14\"", "NovaBook", computo,
                        3200000L, 4, 4.7,
                        "https://picsum.photos/seed/comp-1/600/450",
                        "Laptop ultraligera con procesador de última generación, 16GB RAM, SSD de 512GB y pantalla IPS Full HD."),

                product("Monitor 27\" 144Hz", "ViewMax", computo,
                        1299000L, 7, 4.5,
                        "https://picsum.photos/seed/comp-2/600/450",
                        "Monitor gaming de 27 pulgadas, resolución QHD, 144Hz de refresco y 1ms de respuesta."),

                product("Disco SSD externo 1TB", "DataFast", computo,
                        449900L, 0, 4.6,
                        "https://picsum.photos/seed/comp-3/600/450",
                        "SSD externo portátil de 1TB con USB-C, velocidades de lectura de hasta 1050 MB/s. AGOTADO."),

                // ============ CELULARES (3 productos) ============
                product("Smartphone gama alta 256GB", "PulsePhone", celulares,
                        2899000L, 6, 4.7,
                        "https://picsum.photos/seed/cel-1/600/450",
                        "Smartphone con pantalla AMOLED de 6.7\", cámara triple de 108MP y carga rápida de 65W."),

                product("Smartphone gama media 128GB", "PulsePhone", celulares,
                        1199000L, 12, 4.4,
                        "https://picsum.photos/seed/cel-2/600/450",
                        "Smartphone equilibrado con pantalla de 6.4\", cámara de 64MP y batería de 5000mAh."),

                product("Smartwatch deportivo", "FitBand", celulares,
                        89900L, 15, 4.1,
                        "https://picsum.photos/seed/cel-3/600/450",
                        "Smartwatch con GPS integrado, monitor de frecuencia cardíaca y resistencia al agua 5ATM.")
        ));
    }


    private void seedCoupons() {
        couponRepository.saveAll(List.of(
                coupon("CODESA10", 10, 100000L, 80000L, null),
                coupon("BIENVENIDO25", 25, 400000L, null, null),
                coupon("NAVIDAD2025", 15, 150000L, null, LocalDate.of(2025, 12, 25))
        ));
    }

    private Product product(String name, String brand, Category category,
                            Long price, Integer stock, Double rating,
                            String image, String description) {
        Product p = new Product();
        p.setName(name);
        p.setBrand(brand);
        p.setCategory(category);
        p.setPrice(price);
        p.setStock(stock);
        p.setRating(rating);
        p.setImage(image);
        p.setDescription(description);
        return p;
    }

    private Coupon coupon(String code, Integer percent, Long minSubtotal,
                          Long maxDiscount, LocalDate expiresAt) {
        Coupon c = new Coupon();
        c.setCode(code);
        c.setPercent(percent);
        c.setMinSubtotal(minSubtotal);
        c.setMaxDiscount(maxDiscount);
        c.setExpiresAt(expiresAt);
        return c;
    }
}