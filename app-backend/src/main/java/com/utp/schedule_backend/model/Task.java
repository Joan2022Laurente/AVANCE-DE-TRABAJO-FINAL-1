package com.utp.schedule_backend.model;

import java.time.LocalDate;

public class Task {
    private Long id;
    private Long cursoId;
    private String titulo;
    private String descripcion;
    private LocalDate fechaEntrega;
    private String estado; // Ej: "pendiente", "completada"

    public Task() {}

    public Task(Long id, Long cursoId, String titulo, String descripcion, LocalDate fechaEntrega, String estado) {
        this.id = id;
        this.cursoId = cursoId;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.fechaEntrega = fechaEntrega;
        this.estado = estado;
    }

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
