package com.utp.schedule_backend.controller;

import com.utp.schedule_backend.model.Resource;
import com.utp.schedule_backend.service.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    // Crear recurso asociado a un usuario
    @PostMapping("/user/{userId}")
    public ResponseEntity<Resource> crearRecurso(@PathVariable Long userId, @RequestBody Resource resource) {
        Resource nuevo = resourceService.guardar(userId, resource);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }

    // Obtener todos los recursos de un usuario
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Resource>> obtenerRecursosPorUsuario(@PathVariable Long userId) {
        List<Resource> recursos = resourceService.listarPorUsuario(userId);
        return ResponseEntity.ok(recursos);
    }

    // Eliminar recurso por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarRecurso(@PathVariable Long id) {
        resourceService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
