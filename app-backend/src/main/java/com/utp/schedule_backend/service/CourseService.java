package com.utp.schedule_backend.service;

import com.utp.schedule_backend.model.Course;
import com.utp.schedule_backend.model.User;
import com.utp.schedule_backend.repository.CourseRepository;
import com.utp.schedule_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public CourseService(CourseRepository courseRepository, UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    // Crear curso asignado a un usuario
    public Course crearCurso(Long userId, Course course) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        course.setUser(user);
        return courseRepository.save(course);
    }

    // Listar todos los cursos
    public List<Course> listarCursos() {
        return courseRepository.findAll();
    }

    // Buscar curso por ID
    public Optional<Course> obtenerCurso(Long id) {
        return courseRepository.findById(id);
    }

    // Listar cursos por ID de usuario
    public List<Course> obtenerCursosPorUsuario(Long userId) {
        return courseRepository.findByUserId(userId);
    }
}
