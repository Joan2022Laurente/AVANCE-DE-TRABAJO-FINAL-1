package com.utp.schedule_backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "resources")
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "curso_id")
    private Long cursoId;

    private String tipo;       // Ej: "pdf", "link", "video"
    private String contenido;  // URL o texto
    private String descripcion;

    public Resource() {}

    public Resource(Long id, Long cursoId, String tipo, String contenido, String descripcion) {
        this.id = id;
        this.cursoId = cursoId;
        this.tipo = tipo;
        this.contenido = contenido;
        this.descripcion = descripcion;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCursoId() { return cursoId; }
    public void setCursoId(Long cursoId) { this.cursoId = cursoId; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
}
