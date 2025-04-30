package ru.kata.spring.boot_security.demo.service;

import java.util.List;
import ru.kata.spring.boot_security.demo.model.Role;
import java.util.Optional;

public interface RoleService {
    List<Role> getAllRoles();
    void saveRole(Role role);
    Optional<Role> findByName(String name);
    Optional<Role> findById(Long id);
}
