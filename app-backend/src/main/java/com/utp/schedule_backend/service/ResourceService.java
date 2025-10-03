package com.utp.schedule_backend.service;

import com.utp.schedule_backend.model.Resource;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ResourceService {

    private List<Resource> resources = new ArrayList<>();
    private Long nextId = 1L;

    // Crear recurso
    public Resource crearRecurso(Resource resource) {
        resource.setId(nextId++);
        resources.add(resource);
        return resource;
    }

    // Listar recursos
    public List<Resource> listarRecursos() {
        return resources;
    }

    // Obtener recurso por ID
    public Optional<Resource> obtenerRecurso(Long id) {
        return resources.stream()
                .filter(r -> r.getId().equals(id))
                .findFirst();
    }
}
