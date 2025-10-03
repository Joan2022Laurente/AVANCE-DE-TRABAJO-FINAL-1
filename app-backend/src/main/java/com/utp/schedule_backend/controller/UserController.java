package com.utp.schedule_backend.controller;

import com.utp.schedule_backend.model.User;
import com.utp.schedule_backend.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // Crear usuario
    @PostMapping
    public ResponseEntity<User> crearUsuario(@RequestBody User user) {
        User nuevoUsuario = userService.crearUsuario(user);
        return ResponseEntity.ok(nuevoUsuario);
    }

    // Listar usuarios
    @GetMapping
    public ResponseEntity<List<User>> listarUsuarios() {
        return ResponseEntity.ok(userService.listarUsuarios());
    }

    // Obtener usuario por ID
    @GetMapping("/{id}")
    public ResponseEntity<User> obtenerUsuario(@PathVariable Long id) {
        Optional<User> usuario = userService.obtenerUsuario(id);
        return usuario.map(ResponseEntity::ok)
                      .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
