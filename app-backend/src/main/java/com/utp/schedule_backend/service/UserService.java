package com.utp.schedule_backend.service;

import com.utp.schedule_backend.model.User;
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
        Optional<User> existente = userRepository.findByCodigo(user.getCodigo());

        if (existente.isPresent()) {
            return existente.get();
        }

        if (user.getCourses() != null) {
            user.getCourses().forEach(c -> c.setUser(user));
        }

        return userRepository.save(user);
    }

    public List<User> listarUsuarios() {
        return userRepository.findAll();
    }

    public Optional<User> obtenerUsuario(Long id) {
        return userRepository.findById(id);
    }

    public User crearUsuario(User user) {
        return registrarUsuario(user);
    }
}
