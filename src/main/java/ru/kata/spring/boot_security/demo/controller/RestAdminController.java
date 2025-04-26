package ru.kata.spring.boot_security.demo.controller;

import jakarta.validation.Valid;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import ru.kata.spring.boot_security.demo.model.Role;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.service.UserService;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import ru.kata.spring.boot_security.demo.service.RoleService;

@Controller
@RequestMapping("/admin")
public class AdminController {

    private final UserService userService;
    private final RoleService roleService;

    public AdminController(UserService userService, RoleService roleService) {
        this.userService = userService;
        this.roleService = roleService;
    }

    @GetMapping
    public String showUsers(Model model) {
        List<User> users = userService.getAllUsers();
        model.addAttribute("users", users);
        model.addAttribute("roles", roleService.getAllRoles());
        model.addAttribute("user", new User());
        return "admin/users";
    }

    @GetMapping("/add")
    public String showAddUserForm(Model model) {
        model.addAttribute("user", new User());
        model.addAttribute("roles", roleService.getAllRoles());
        return "admin/add_user";
    }

    @PostMapping("/add")
    public String addUser(@ModelAttribute("user") @Valid User user,
                          @RequestParam(value = "roles", required = false) List<Long> roleIds,
                          BindingResult result, Model model) {
        System.out.println("Received: firstName=" + user.getFirstName() +
                ", lastName=" + user.getLastName() +
                ", age=" + user.getAge() +
                ", email=" + user.getEmail() +
                ", roleIds=" + roleIds);

        if (roleIds == null || roleIds.isEmpty()) {
            result.addError(new FieldError("user", "roles", "At least one role must be selected"));
        }

        if (result.hasErrors()) {
            System.out.println("Validation errors detected: " + result.getAllErrors());
            List<User> users = userService.getAllUsers();
            model.addAttribute("users", users);
            model.addAttribute("roles", roleService.getAllRoles());
            return "admin/users";
        }

        Set<Role> roles = roleIds.stream()
                .map(id -> roleService.getAllRoles().stream()
                        .filter(role -> role.getId().equals(id))
                        .findFirst()
                        .orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        user.setRoles(roles);

        userService.addUser(user);
        System.out.println("Called addUser for email=" + user.getEmail());
        return "redirect:/admin";
    }

    @PostMapping("/edit")
    public String editUser(@ModelAttribute("user") @Valid User user,
                           @RequestParam(value = "roles", required = false) List<Long> roleIds,
                           BindingResult result, Model model) {
        System.out.println("Received: id=" + user.getId() +
                ", firstName=" + user.getFirstName() +
                ", lastName=" + user.getLastName() +
                ", age=" + user.getAge() +
                ", email=" + user.getEmail() +
                ", roleIds=" + roleIds);
        if (result.hasErrors()) {
            System.out.println("Validation errors detected");
            List<User> users = userService.getAllUsers();
            model.addAttribute("users", users);
            model.addAttribute("roles", roleService.getAllRoles());
            return "admin/users";
        }
        if (roleIds != null && !roleIds.isEmpty()) {
            Set<Role> roles = roleIds.stream()
                    .map(id -> roleService.getAllRoles().stream()
                            .filter(role -> role.getId().equals(id))
                            .findFirst()
                            .orElse(null))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());
            user.setRoles(roles);
        } else {
            user.setRoles(new HashSet<>());
        }
        userService.updateUser(user);
        System.out.println("Called updateUser for id=" + user.getId());
        return "redirect:/admin";
    }

    @PostMapping("/delete")
    public String deleteUser(@RequestParam("id") Long id) {
        userService.deleteUser(id);
        return "redirect:/admin";
    }
}