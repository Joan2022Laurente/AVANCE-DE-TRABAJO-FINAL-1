package com.utp.schedule_backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "tasks") // nombre de la tabla en la BD
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "curso_id")
    private Long cursoId;

    @Column(nullable = false)
    private String titulo;

    @Column(length = 500)
    private String descripcion;

    @Column(name = "fecha_entrega")
    private LocalDate fechaEntrega;

    @Column(nullable = false)
    private String estado; // Ej: "pendiente", "completada"

    // Constructor vacío (obligatorio para JPA)
    public Task() {}

    // Constructor completo
    public Task(Long id, Long cursoId, String titulo, String descripcion, LocalDate fechaEntrega, String estado) {
        this.id = id;
        this.cursoId = cursoId;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.fechaEntrega = fechaEntrega;
        this.estado = estado;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCursoId() { return cursoId; }
    public void setCursoId(Long cursoId) { this.cursoId = cursoId; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public LocalDate getFechaEntrega() { return fechaEntrega; }
    public void setFechaEntrega(LocalDate fechaEntrega) { this.fechaEntrega = fechaEntrega; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}
