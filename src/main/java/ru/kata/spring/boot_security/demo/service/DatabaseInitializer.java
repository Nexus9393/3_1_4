package ru.kata.spring.boot_security.demo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import ru.kata.spring.boot_security.demo.model.Role;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.repository.RoleRepository;
import ru.kata.spring.boot_security.demo.repository.UserRepository;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseInitializer.class);
    private final UserService userService;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    @Autowired
    public DatabaseInitializer(UserService userService, RoleRepository roleRepository, UserRepository userRepository) {
        this.userService = userService;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        logger.info("Initializing roles...");
        Role adminRole = initializeRole("ADMIN");
        Role userRole = initializeRole("USER");

        logger.info("Initializing admin user...");
        initializeUser(
                "Admin",
                "User",
                30,
                "admin@example.com",
                "admin123",
                Set.of(adminRole)
        );

        logger.info("Initializing user...");
        initializeUser(
                "Regular",
                "User",
                25,
                "user@example.com",
                "user123",
                Set.of(userRole)
        );

        userRepository.findByEmail("admin@example.com").ifPresent(user -> {
            logger.info("Admin user in DB: email={}, roles={}", user.getEmail(), user.getRoles());
        });
        userRepository.findByEmail("user@example.com").ifPresent(user -> {
            logger.info("User in DB: email={}, roles={}", user.getEmail(), user.getRoles());
        });
    }

    private Role initializeRole(String roleName) {
        Optional<Role> roleOptional = roleRepository.findByName(roleName);
        Role role = roleOptional.orElseGet(() -> {
            logger.info("Creating role: {}", roleName);
            Role newRole = new Role();
            newRole.setName(roleName);
            return roleRepository.save(newRole);
        });
        logger.info("Role created/found: {} with ID: {}", roleName, role.getId());
        return role;
    }

    private void initializeUser(String firstName, String lastName, Integer age, String email, String password, Set<Role> roles) {
        if (userRepository.findByEmail(email).isEmpty()) {
            logger.info("Creating user: {}", email);
            User user = new User();
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setAge(age);
            user.setEmail(email);
            user.setPassword(password);
            user.setRoles(new HashSet<>(roles));
            userService.addUser(user);
            logger.info("User created: {} with roles: {}", email, roles);
        } else {
            logger.info("User already exists: {}", email);
        }
    }
}