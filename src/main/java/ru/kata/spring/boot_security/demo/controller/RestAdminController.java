package ru.kata.spring.boot_security.demo.controller;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.model.Role;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.repository.UserRepository;
import ru.kata.spring.boot_security.demo.service.RoleService;
import ru.kata.spring.boot_security.demo.service.UserService;
import java.util.List;
import ru.kata.spring.boot_security.demo.dto.RoleDTO;
import ru.kata.spring.boot_security.demo.dto.UserDTO;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class RestAdminController {

    private final UserService userService;
    private final RoleService roleService;
    private final UserRepository userRepository;

    public RestAdminController(UserService userService, RoleService roleService, UserRepository userRepository) {
        this.userService = userService;
        this.roleService = roleService;
        this.userRepository = userRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> userDTOs = userService.getAllUsers().stream()
                .map(this::convertToUserDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDTOs);
    }

    @GetMapping("/roles")
    public ResponseEntity<List<RoleDTO>> getAllRoles() {
        List<RoleDTO> roleDTOs = roleService.getAllRoles().stream()
                .map(this::convertToRoleDTO)
                .collect(Collectors.toList());
        System.out.println("Roles returned: " + roleDTOs);
        return ResponseEntity.ok(roleDTOs);
    }

    @PostMapping("/users")
    public ResponseEntity<?> addUser(@Valid @RequestBody UserDTO userDTO) {
        if (userDTO.getRoles() == null || userDTO.getRoles().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("At least one role is required");
        }
        try {
            User user = convertToUser(userDTO);
            userService.addUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToUserDTO(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@Valid @RequestBody UserDTO userDTO, @PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        try {
            User user = convertToUser(userDTO);
            user.setId(id);
            userService.updateUser(user);
            if (currentUser != null && currentUser.getId().equals(id)) {
                User updatedUser = userRepository.findById(id)
                        .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
                SecurityContextHolder.getContext().setAuthentication(
                        new UsernamePasswordAuthenticationToken(
                                updatedUser,
                                updatedUser.getPassword(),
                                updatedUser.getAuthorities()
                        )
                );
            }

            return ResponseEntity.ok(convertToUserDTO(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok("User deleted successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        User user = userService.getAllUsers().stream()
                .filter(u -> u.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
        return ResponseEntity.ok(convertToUserDTO(user));
    }

    private UserDTO convertToUserDTO(User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setFirstName(user.getFirstName());
        userDTO.setLastName(user.getLastName());
        userDTO.setAge(user.getAge());
        userDTO.setEmail(user.getEmail());
        userDTO.setRoles(user.getRoles().stream()
                .map(this::convertToRoleDTO)
                .collect(Collectors.toSet()));
        return userDTO;
    }

    private User convertToUser(UserDTO userDTO) {
        User user = new User();
        user.setId(userDTO.getId());
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setAge(userDTO.getAge());
        user.setEmail(userDTO.getEmail());
        user.setPassword(userDTO.getPassword());
        user.setRoles(userDTO.getRoles().stream()
                .map(roleDTO -> roleService.findById(roleDTO.getId())
                        .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleDTO.getId())))
                .collect(Collectors.toSet()));
        return user;
    }

    private RoleDTO convertToRoleDTO(Role role) {
        RoleDTO roleDTO = new RoleDTO();
        roleDTO.setId(role.getId());
        roleDTO.setName(role.getName());
        return roleDTO;
    }
}