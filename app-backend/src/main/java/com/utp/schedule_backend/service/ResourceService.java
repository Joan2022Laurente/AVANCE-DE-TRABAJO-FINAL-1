package com.utp.schedule_backend.service;

import com.utp.schedule_backend.model.Resource;
import com.utp.schedule_backend.model.User;
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

    // Listar todos los recursos de un usuario
    public List<Resource> listarPorUsuario(Long userId) {
        return userRepository.findById(userId)
                .map(resourceRepository::findByUser)
                .orElse(List.of());
    }

    // Guardar recurso asociado a un usuario
    public Resource guardar(Long userId, Resource resource) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        resource.setUser(user);
        if (resource.getFechaCreacion() == null) {
            resource.setFechaCreacion(LocalDateTime.now());
        }

        return resourceRepository.save(resource);
    }

    // Eliminar recurso por ID
    public void eliminar(Long id) {
        if (!resourceRepository.existsById(id)) {
            throw new RuntimeException("Recurso no encontrado");
        }
        resourceRepository.deleteById(id);
    }
}
