package com.utp.schedule_backend.service;

import com.utp.schedule_backend.model.User;
import com.utp.schedule_backend.model.Course;
import com.utp.schedule_backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User registrarUsuario(User user) {
        // Verificar si el usuario ya existe por código
        Optional<User> existente = userRepository.findAll().stream()
                .filter(u -> u.getCodigo().equalsIgnoreCase(user.getCodigo()))
                .findFirst();

        if (existente.isPresent()) {
            // Ya existe, retornar el existente
            return existente.get();
        }

        // Establecer relación bidireccional en cursos
        if (user.getCourses() != null) {
            for (Course c : user.getCourses()) {
                c.setUser(user);
            }
        }

        // Guardar usuario (y cursos en cascada)
        return userRepository.save(user);
    }

    // ✅ Listar todos los usuarios
    public List<User> listarUsuarios() {
        return userRepository.findAll();
    }

    // ✅ Buscar un usuario por ID (opcional, útil si quieres GET /api/users/{id})
    public Optional<User> obtenerUsuario(Long id) {
        return userRepository.findById(id);
    }

    public User crearUsuario(User user) {
        return registrarUsuario(user);
    }
}
