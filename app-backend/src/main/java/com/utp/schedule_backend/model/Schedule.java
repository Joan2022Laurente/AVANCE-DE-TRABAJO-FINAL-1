package com.utp.schedule_backend.model;

public class Schedule {
    private Long id;
    private Long cursoId;
    private String dia;
    private String horaInicio;
    private String horaFin;
    private String modalidad;

    public Schedule() {
    }

    public Schedule(Long id, Long cursoId, String dia, String horaInicio, String horaFin, String modalidad) {
        this.id = id;
        this.cursoId = cursoId;
        this.dia = dia;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
        this.modalidad = modalidad;
    }

    //getters y setters...

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCursoId() {
        return cursoId;
    }

    public void setCursoId(Long cursoId) {
        this.cursoId = cursoId;
    }

    public String getDia() {
        return dia;
    }

    public void setDia(String dia) {
        this.dia = dia;
    }

    public String getHoraInicio() {
        return horaInicio;
    }

    public void setHoraInicio(String horaInicio) {
        this.horaInicio = horaInicio;
    }

    public String getHoraFin() {
        return horaFin;
    }

    public void setHoraFin(String horaFin) {
        this.horaFin = horaFin;
    }

    public String getModalidad() {
        return modalidad;
    }

    public void setModalidad(String modalidad) {
        this.modalidad = modalidad;
    }
}
