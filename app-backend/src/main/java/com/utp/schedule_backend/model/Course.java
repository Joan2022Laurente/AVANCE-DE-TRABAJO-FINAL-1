package com.utp.schedule_backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "courses")
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String codigo;
    private String docente;

    @Column(name = "user_id")
    private Long userId; // relación simple con User

    public Course() {}

    public Course(Long id, String nombre, String codigo, String docente, Long userId) {
        this.id = id;
        this.nombre = nombre;
        this.codigo = codigo;
        this.docente = docente;
        this.userId = userId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getDocente() { return docente; }
    public void setDocente(String docente) { this.docente = docente; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}
