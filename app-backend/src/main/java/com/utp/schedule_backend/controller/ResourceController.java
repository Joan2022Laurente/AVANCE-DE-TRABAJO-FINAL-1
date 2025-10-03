package com.utp.schedule_backend.controller;

import com.utp.schedule_backend.model.Resource;
import com.utp.schedule_backend.service.ResourceService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    // Crear recurso
    @PostMapping
    public ResponseEntity<Resource> crearRecurso(@RequestBody Resource resource) {
        return ResponseEntity.ok(resourceService.crearRecurso(resource));
    }

    // Listar recursos
    @GetMapping
    public ResponseEntity<List<Resource>> listarRecursos() {
        return ResponseEntity.ok(resourceService.listarRecursos());
    }

    // Obtener recurso por ID
    @GetMapping("/{id}")
    public ResponseEntity<Resource> obtenerRecurso(@PathVariable Long id) {
        Optional<Resource> recurso = resourceService.obtenerRecurso(id);
        return recurso.map(ResponseEntity::ok)
                      .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
