package com.utp.schedule_backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users") // puedes cambiar el nombre si lo deseas
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    // Constructor vacío obligatorio para JPA
    public User() {}

    // Constructor con parámetros
    public User(Long id, String nombre) {
        this.id = id;
        this.nombre = nombre;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}
