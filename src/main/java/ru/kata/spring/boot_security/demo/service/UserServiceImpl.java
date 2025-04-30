package ru.kata.spring.boot_security.demo.service;

import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.repository.UserRepository;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserServiceImpl implements UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void addUser(User user) {
        logger.info("Adding user: {}", user.getEmail());
        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            throw new IllegalArgumentException("Email already exists: " + user.getEmail());
        }
        String rawPassword = user.getPassword();
        logger.info("Encoding password for user: {}", user.getEmail());
        String encodedPassword = passwordEncoder.encode(rawPassword);
        user.setPassword(encodedPassword);
        userRepository.save(user);
        logger.info("User saved: {}", user.getEmail());
    }

    @Override
    public void updateUser(User user) {
        logger.info("Updating user: {}", user.getEmail());
        User existingUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("User with id " + user.getId() + " not found"));
        Optional<User> userWithSameEmail = userRepository.findByEmail(user.getEmail());
        if (userWithSameEmail.isPresent() && !userWithSameEmail.get().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Email already exists: " + user.getEmail());
        }
        existingUser.setFirstName(user.getFirstName());
        existingUser.setLastName(user.getLastName());
        existingUser.setAge(user.getAge());
        existingUser.setEmail(user.getEmail());
        existingUser.setRoles(user.getRoles());
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            String encodedPassword = passwordEncoder.encode(user.getPassword());
            logger.info("Updating password for {}: {}", user.getEmail(), encodedPassword);
            existingUser.setPassword(encodedPassword);
        }
        userRepository.save(existingUser);
        logger.info("User updated: {}", user.getEmail());
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        logger.info("Fetching all users...");
        List<User> users = userRepository.findAll();
        logger.info("Fetched {} users", users.size());
        return users;
    }

    @Override
    public void deleteUser(Long id) {
        logger.info("Deleting user with id: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User with id " + id + " not found"));
        userRepository.delete(user);
        logger.info("User deleted: {}", id);
    }
}