package com.utp.schedule_backend.service;

import com.utp.schedule_backend.model.Course;
import com.utp.schedule_backend.model.Resource;
import com.utp.schedule_backend.model.User;
import com.utp.schedule_backend.repository.CourseRepository;
import com.utp.schedule_backend.repository.ResourceRepository;
import com.utp.schedule_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    public List<Resource> listarPorUsuario(Long userId) {
        return userRepository.findById(userId)
                .map(resourceRepository::findByUser)
                .orElse(List.of());
    }

    public List<Resource> listarPorCurso(Long courseId) {
        return courseRepository.findById(courseId)
                .map(resourceRepository::findByCourse)
                .orElse(List.of());
    }

    public Resource guardar(Long userId, Long courseId, Resource resource) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        resource.setUser(user);
        resource.setCourse(course);

        if (resource.getFechaCreacion() == null) {
            resource.setFechaCreacion(LocalDateTime.now());
        }

        return resourceRepository.save(resource);
    }

    public void eliminar(Long id) {
        if (!resourceRepository.existsById(id)) {
            throw new RuntimeException("Recurso no encontrado");
        }
        resourceRepository.deleteById(id);
    }
}
