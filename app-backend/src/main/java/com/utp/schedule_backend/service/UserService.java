package com.utp.schedule_backend.service;

import com.utp.schedule_backend.model.User;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private List<User> users = new ArrayList<>();
    private Long nextId = 1L;

    public User crearUsuario(User user) {
        user.setId(nextId++);
        users.add(user);
        return user;
    }

    public List<User> listarUsuarios() {
        return users;
    }

    public Optional<User> obtenerUsuario(Long id) {
        return users.stream()
                .filter(u -> u.getId().equals(id))
                .findFirst();
    }
}
