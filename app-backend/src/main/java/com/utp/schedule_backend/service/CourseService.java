package com.utp.schedule_backend.service;

import com.utp.schedule_backend.model.Course;
import com.utp.schedule_backend.repository.CourseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CourseService {

    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    // Crear curso
    public Course crearCurso(Course course) {
        return courseRepository.save(course);
    }

    // Listar todos
    public List<Course> listarCursos() {
        return courseRepository.findAll();
    }

    // Buscar por ID
    public Optional<Course> obtenerCurso(Long id) {
        return courseRepository.findById(id);
    }

    // Listar cursos por usuario
    public List<Course> obtenerCursosPorUsuario(Long userId) {
        return courseRepository.findByUserId(userId);
    }
}
