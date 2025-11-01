package com.utp.schedule_backend.controller;

import com.utp.schedule_backend.model.User;
import com.utp.schedule_backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // Registrar usuario
    @PostMapping
    public ResponseEntity<User> registrarUsuario(@RequestBody User user) {
        User nuevoUsuario = userService.registrarUsuario(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoUsuario);
    }

    // Listar todos los usuarios 
    @GetMapping
    public ResponseEntity<List<User>> listarUsuarios() {
        List<User> usuarios = userService.listarUsuarios();
        return ResponseEntity.ok(usuarios);
    }
}
