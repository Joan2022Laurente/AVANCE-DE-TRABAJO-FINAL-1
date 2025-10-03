package com.utp.schedule_backend.service;

import com.utp.schedule_backend.model.Course;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CourseService {

    private List<Course> courses = new ArrayList<>();
    private Long nextId = 1L;

    // Crear curso
    public Course crearCurso(Course course) {
        course.setId(nextId++);
        courses.add(course);
        return course;
    }

    // Listar todos
    public List<Course> listarCursos() {
        return courses;
    }

    // Buscar por ID
    public Optional<Course> obtenerCurso(Long id) {
        return courses.stream()
                .filter(c -> c.getId().equals(id))
                .findFirst();
    }

    // Listar cursos por usuario
    public List<Course> obtenerCursosPorUsuario(Long userId) {
        List<Course> cursosUsuario = new ArrayList<>();
        for (Course c : courses) {
            if (c.getUserId() != null && c.getUserId().equals(userId)) {
                cursosUsuario.add(c);
            }
        }
        return cursosUsuario;
    }
}
