package ru.kata.spring.boot_security.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RoleDTO {

    private Long id;

    @NotBlank(message = "Role name is required")
    @Size(min = 1, max = 50, message = "Role name must be between 1 and 50 characters")
    private String name;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}