package com.utp.schedule_backend.service;

import com.utp.schedule_backend.model.User;
import com.utp.schedule_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User crearUsuario(User user) {
        return userRepository.save(user);
    }

    public List<User> listarUsuarios() {
        return userRepository.findAll();
    }

    public Optional<User> obtenerUsuario(Long id) {
        return userRepository.findById(id);
    }
}
