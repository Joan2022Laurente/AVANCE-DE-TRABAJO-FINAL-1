package com.utp.schedule_backend.controller;

import com.utp.schedule_backend.model.Course;
import com.utp.schedule_backend.service.CourseService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;

    // Crear curso
    @PostMapping
    public ResponseEntity<Course> crearCurso(@RequestBody Course course) {
        Course nuevoCurso = courseService.crearCurso(course);
        return ResponseEntity.ok(nuevoCurso);
    }

    // Listar cursos
    @GetMapping
    public ResponseEntity<List<Course>> listarCursos() {
        return ResponseEntity.ok(courseService.listarCursos());
    }

    // Obtener curso por ID
    @GetMapping("/{id}")
    public ResponseEntity<Course> obtenerCurso(@PathVariable Long id) {
        Optional<Course> curso = courseService.obtenerCurso(id);
        return curso.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Obtener cursos por usuario
    @GetMapping("/usuario/{userId}")
    public ResponseEntity<List<Course>> obtenerCursosPorUsuario(@PathVariable Long userId) {
        return ResponseEntity.ok(courseService.obtenerCursosPorUsuario(userId));
    }
}
