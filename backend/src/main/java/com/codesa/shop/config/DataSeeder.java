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
                product("Audífonos in-ear con cancelación de ruido activa", "Sonik", audio,
                        189900L, 8, 4.5,
                        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
                        "Cancelación activa de ruido híbrida de 35dB, transductores de grafeno de 10mm y hasta 32 horas de batería combinada con estuche de carga rápida."),

                product("Altavoz Bluetooth resistente al agua IPX7", "AuraSound", audio,
                        149900L, 15, 4.7,
                        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80",
                        "Potencia de 20W RMS con radiadores pasivos duales para bajos profundos. Batería de larga duración de 16 horas y protección contra inmersión IPX7."),

                product("Micrófono USB Cardioide para Streaming y Podcast", "Sonik", audio,
                        289900L, 14, 4.6,
                        "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80", // URL corregida
                        "Cápsula de condensador de 24 bits / 96kHz, botón táctil de silencio con indicador LED bicolor, filtro antipop integrado y montura antivibración."),

                // ============ PERIFÉRICOS (3 productos) ============
                product("Teclado mecánico inalámbrico Custom RGB 75%", "KeyVibe", perifericos,
                        349900L, 0, 4.8,
                        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
                        "Switches intercambiables en caliente (Hot-Swap), chasis de aluminio CNC con amortiguación acústica de espuma Poron y conectividad triple modo."),

                product("Mouse Ultraligero Inalámbrico 49g Sensor 26K", "PulseTech", perifericos,
                        219900L, 12, 4.6,
                        "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80",
                        "Sensor óptico PAW3395 de última generación, switches ópticos Kailh GM 8.0 y tasa de sondeo ultra rápida de hasta 4000Hz."),

                product("Hub USB-C 8 en 1 HDMI 4K 100W Power Delivery", "ApexVision", perifericos,
                        139900L, 20, 4.4,
                        "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600&auto=format&fit=crop&q=80",
                        "Salida HDMI 4K@60Hz, puerto Ethernet Gigabit RJ45, lector de tarjetas SD/TF y carga pass-through de 100W en cuerpo de aluminio."),

                // ============ CÓMPUTO (3 productos) ============
                product("Monitor Gamer Curvo 27\" QHD 165Hz 1ms", "ApexVision", computo,
                        1299000L, 2, 4.9,
                        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
                        "Panel Fast VA con curvatura 1500R, resolución 2560x1440, compatibilidad con AMD FreeSync Premium y cobertura 99% sRGB."),

                product("Portátil Ultra Delgado 14\" Core i7 16GB 512GB", "OmniBook", computo,
                        3199000L, 4, 4.7,
                        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80",
                        "Cuerpo de aleación de magnesio de 1.1kg, pantalla OLED 2.8K 90Hz calibrada de fábrica, Thunderbolt 4 y autonomía de hasta 14 horas."),

                product("Memoria RAM DDR5 32GB (2x16GB) 6000MHz CL30", "PulseTech", computo,
                        499900L, 7, 4.9,
                        "https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?w=600&auto=format&fit=crop&q=80",
                        "Disipador térmico de aluminio anodizado, soporte para perfiles Intel XMP 3.0 y AMD EXPO para máximo rendimiento en overclocking."),

                // ============ CELULARES (3 productos) ============
                product("Smartphone Pro 5G 256GB Cámara 108MP", "NovaMobile", celulares,
                        2499000L, 5, 4.8,
                        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
                        "Pantalla AMOLED de 6.7 pulgadas a 120Hz adaptativa, procesador de 4nm con IA avanzada y carga hiper rápida de 67W en caja."),

                product("Smartphone Lite 128GB Batería 5000mAh", "NovaMobile", celulares,
                        899000L, 9, 4.3,
                        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
                        "Rendimiento eficiente para todo el día, diseño ultradelgado de 7.9mm, cámara principal de 50MP y lector de huellas lateral ergonómico."),

                product("Cargador Rápido GaN 65W Triple Puerto USB-C", "NovaMobile", celulares,
                        89900L, 25, 4.8,
                        "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80",
                        "Tecnología de nitruro de galio (GaN) de tamaño ultra compacto, distribución inteligente de potencia para laptop, celular y audífonos simultáneamente.")
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