package ru.kata.spring.boot_security.demo.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import ru.kata.spring.boot_security.demo.dto.RoleDTO;
import ru.kata.spring.boot_security.demo.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import ru.kata.spring.boot_security.demo.dto.UserDTO;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class UserController {

    @GetMapping("/user")
    public ResponseEntity<UserDTO> getCurrentUser(@AuthenticationPrincipal User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setFirstName(user.getFirstName());
        userDTO.setLastName(user.getLastName());
        userDTO.setAge(user.getAge());
        userDTO.setEmail(user.getEmail());
        userDTO.setRoles(user.getRoles().stream()
                .map(role -> {
                    RoleDTO roleDTO = new RoleDTO();
                    roleDTO.setId(role.getId());
                    roleDTO.setName(role.getName());
                    return roleDTO;
                })
                .collect(Collectors.toSet()));
        return ResponseEntity.ok(userDTO);
    }
}