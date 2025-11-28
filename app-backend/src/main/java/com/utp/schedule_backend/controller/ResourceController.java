package com.utp.schedule_backend.controller;

import com.utp.schedule_backend.model.Resource;
import com.utp.schedule_backend.service.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    // Crear recurso asociado a un usuario y un curso
    @PostMapping("/user/{userId}/course/{courseId}")
    public ResponseEntity<Resource> crearRecurso(
            @PathVariable Long userId,
            @PathVariable Long courseId,
            @RequestBody Resource resource) {
        Resource nuevo = resourceService.guardar(userId, courseId, resource);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }

    // Obtener todos los recursos de un usuario
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Resource>> obtenerRecursosPorUsuario(@PathVariable Long userId) {
        List<Resource> recursos = resourceService.listarPorUsuario(userId);
        return ResponseEntity.ok(recursos);
    }

    // Obtener todos los recursos de un curso
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Resource>> obtenerRecursosPorCurso(@PathVariable Long courseId) {
        List<Resource> recursos = resourceService.listarPorCurso(courseId);
        return ResponseEntity.ok(recursos);
    }

    // Eliminar recurso por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarRecurso(@PathVariable Long id) {
        resourceService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
