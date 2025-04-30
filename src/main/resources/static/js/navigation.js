console.log("navigation.js: Script loaded");

$(document).ready(function () {
    console.log("navigation.js: jQuery ready");
    let isAdmin = false;

    fetch('/api/user')
        .then(response => {
            if (!response.ok) {
                console.log("User not authenticated, staying on login page");
                return;
            }
            return response.json();
        })
        .then(user => {
            if (user) {
                console.log("Current user:", user);
                isAdmin = user.roles.some(role => role.name === 'ADMIN');
                // Перенаправляем на нужную страницу после логина
                const initialPage = window.location.pathname.split('/').pop() || 'user';
                console.log("Initial page:", initialPage);
                if (initialPage === 'admin' && isAdmin) {
                    loadAdminPage();
                } else if (initialPage === 'user' || initialPage === 'login') {
                    loadUserPage();
                }
            }
        })
        .catch(error => console.error('Error checking user role:', error));

    $(document).on('click', '.sidebar a', function (e) {
        e.preventDefault();
        const page = $(this).data('page');
        console.log("Navigating to page:", page);
        if (page === 'admin' && !isAdmin) {
            alert("Access denied");
            return;
        }
        loadPageContent(page);
    });

    function loadPageContent(page) {
        if (page === 'admin') {
            loadAdminPage();
        } else if (page === 'user') {
            loadUserPage();
        }
    }

    function loadAdminPage() {
        const adminHtml = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-md-2 sidebar">
                        <a href="#" data-page="admin"><i class="fas fa-user-shield"></i> Admin</a>
                        <a href="#" data-page="user"><i class="fas fa-user"></i> User</a>
                    </div>
                    <div class="col-md-10 main-content">
                        <h1>Admin panel</h1>
                        <h2>Users table</h2>
                        <div class="card">
                            <div class="card-header">
                                <ul class="nav nav-tabs card-header-tabs">
                                    <li class="nav-item">
                                        <a class="nav-link active" href="#" data-toggle="tab">All users</a>
                                    </li>
                                    <li class="nav-item">
                                        <button class="nav-link admin-only" data-toggle="modal" data-target="#addUserModal">New User</button>
                                    </li>
                                </ul>
                            </div>
                            <div class="card-body">
                                <table class="table table-striped" id="usersTable">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>First name</th>
                                            <th>Last name</th>
                                            <th>Age</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Edit</th>
                                            <th>Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody id="usersTableBody"></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal fade" id="addUserModal" tabindex="-1" role="dialog" aria-labelledby="addUserModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="addUserModalLabel">Add New User</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">×</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <form id="addUserForm">
                                <div class="form-group">
                                    <label for="addFirstName">First name</label>
                                    <input type="text" class="form-control" id="addFirstName" name="firstName" required>
                                    <span class="text-danger" id="addFirstNameError"></span>
                                </div>
                                <div class="form-group">
                                    <label for="addLastName">Last name</label>
                                    <input type="text" class="form-control" id="addLastName" name="lastName" required>
                                    <span class="text-danger" id="addLastNameError"></span>
                                </div>
                                <div class="form-group">
                                    <label for="addAge">Age</label>
                                    <input type="number" class="form-control" id="addAge" name="age">
                                    <span class="text-danger" id="addAgeError"></span>
                                </div>
                                <div class="form-group">
                                    <label for="addEmail">Email</label>
                                    <input type="email" class="form-control" id="addEmail" name="email" required>
                                    <span class="text-danger" id="addEmailError"></span>
                                </div>
                                <div class="form-group">
                                    <label for="addPassword">Password</label>
                                    <input type="password" class="form-control" id="addPassword" name="password" required>
                                    <span class="text-danger" id="addPasswordError"></span>
                                </div>
                                <div class="form-group">
                                    <label for="addRoles">Role</label>
                                    <select multiple class="form-control" id="addRoles" name="roles" required>
                                    </select>
                                    <span class="text-danger" id="addRolesError"></span>
                                </div>
                                <button type="button" class="btn btn-add" id="saveNewUser">Add new user</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal fade" id="editUserModal" tabindex="-1" role="dialog" aria-labelledby="editUserModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="editUserModalLabel">Edit User</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">×</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <form id="editUserForm">
                                <div class="form-group">
                                    <label for="editId">ID</label>
                                    <input type="text" class="form-control" id="editId" name="id" readonly>
                                </div>
                                <div class="form-group">
                                    <label for="editFirstName">First name</label>
                                    <input type="text" class="form-control" id="editFirstName" name="firstName" required>
                                    <span class="text-danger" id="editFirstNameError"></span>
                                </div>
                                <div class="form-group">
                                    <label for="editLastName">Last name</label>
                                    <input type="text" class="form-control" id="editLastName" name="lastName" required>
                                    <span class="text-danger" id="editLastNameError"></span>
                                </div>
                                <div class="form-group">
                                    <label for="editAge">Age</label>
                                    <input type="number" class="form-control" id="editAge" name="age">
                                    <span class="text-danger" id="editAgeError"></span>
                                </div>
                                <div class="form-group">
                                    <label for="editEmail">Email</label>
                                    <input type="email" class="form-control" id="editEmail" name="email" required>
                                    <span class="text-danger" id="editEmailError"></span>
                                </div>
                                <div class="form-group">
                                    <label for="editPassword">Password (leave blank to keep unchanged)</label>
                                    <input type="password" class="form-control" id="editPassword" name="password">
                                    <span class="text-danger" id="editPasswordError"></span>
                                </div>
                                <div class="form-group">
                                    <label for="editRoles">Role</label>
                                    <select multiple class="form-control" id="editRoles" name="roles" required>
                                    </select>
                                    <span class="text-danger" id="editRolesError"></span>
                                </div>
                                <button type="button" class="btn btn-primary" id="saveEditedUser">Save changes</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal fade" id="deleteUserModal" tabindex="-1" role="dialog" aria-labelledby="deleteUserModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title" id="deleteUserModalLabel">Delete User</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">×</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <p>Are you sure you want to delete this user? This action cannot be undone.</p>
                            <p><strong>ID:</strong> <span id="deleteId"></span></p>
                            <p><strong>Name:</strong> <span id="deleteName"></span></p>
                            <p><strong>Email:</strong> <span id="deleteEmail"></span></p>
                            <p><strong>Roles:</strong> <span id="deleteRoles"></span></p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-danger" id="confirmDelete">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        $('body').html(adminHtml);
        loadAdminData();
        history.pushState(null, null, '/admin');
    }

    function loadUserPage() {
        const userHtml = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-md-2 sidebar">
                        <a href="#" data-page="admin"><i class="fas fa-user-shield"></i> Admin</a>
                        <a href="#" data-page="user"><i class="fas fa-user"></i> User</a>
                    </div>
                    <div class="col-md-10 main-content">
                        <h1>User Page</h1>
                        <div class="profile-card">
                            <h2>User Information</h2>
                            <table class="table" id="userTable">
                                <tr><th>ID</th><td id="userId"></td></tr>
                                <tr><th>First Name</th><td id="userFirstName"></td></tr>
                                <tr><th>Last Name</th><td id="userLastName"></td></tr>
                                <tr><th>Age</th><td id="userAge"></td></tr>
                                <tr><th>Email</th><td id="userEmail"></td></tr>
                                <tr><th>Roles</th><td id="userRoles"></td></tr>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        $('body').html(userHtml);
        loadUserData();
        history.pushState(null, null, '/user');
    }

    function loadAdminData() {
        console.log("Loading admin data...");
        fetch('/api/admin/users')
            .then(response => {
                if (response.status === 403) {
                    window.location.href = '/login';
                    return;
                }
                if (!response.ok) {
                    throw new Error(`Failed to fetch users: ${response.status}`);
                }
                return response.json();
            })
            .then(users => {
                if (!users) return;
                console.log("Users data:", users);
                const tbody = $('#usersTableBody');
                tbody.empty();
                users.forEach(user => {
                    const roles = user.roles ? user.roles.map(r => r.name).join(', ') : 'No roles';
                    tbody.append(`
                        <tr>
                            <td>${user.id || 'N/A'}</td>
                            <td>${user.firstName || 'N/A'}</td>
                            <td>${user.lastName || 'N/A'}</td>
                            <td>${user.age || 'N/A'}</td>
                            <td>${user.email || 'N/A'}</td>
                            <td>${roles}</td>
                            <td><button class="btn btn-edit btn-sm edit-user admin-only" data-id="${user.id}">Edit</button></td>
                            <td><button class="btn btn-danger btn-sm delete-user admin-only" data-id="${user.id}">Delete</button></td>
                        </tr>
                    `);
                });

                fetch('/api/admin/roles')
                    .then(response => {
                        if (response.status === 403) {
                            window.location.href = '/login';
                            return;
                        }
                        if (!response.ok) {
                            throw new Error(`Failed to fetch roles: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(roles => {
                        if (!roles) return;
                        console.log("Roles data:", roles);
                        const addRolesSelect = $('#addRoles');
                        const editRolesSelect = $('#editRoles');
                        addRolesSelect.empty();
                        editRolesSelect.empty();
                        roles.forEach(role => {
                            addRolesSelect.append(`<option value="${role.id}">${role.name}</option>`);
                            editRolesSelect.append(`<option value="${role.id}">${role.name}</option>`);
                        });
                    })
                    .catch(error => console.error('Error loading roles:', error));
            })
            .catch(error => console.error('Error loading users:', error));
    }

    function loadUserData() {
        console.log("Loading user data...");
        fetch('/api/user', {
            headers: { 'Cache-Control': 'no-cache' }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch user data: ${response.status}`);
                }
                return response.json();
            })
            .then(user => {
                console.log("User data received:", user);
                $('#userId').text(user.id || 'N/A');
                $('#userFirstName').text(user.firstName || 'N/A');
                $('#userLastName').text(user.lastName || 'N/A');
                $('#userAge').text(user.age || 'N/A');
                $('#userEmail').text(user.email || 'N/A');
                $('#userRoles').text(user.roles ? user.roles.map(r => r.name).join(', ') : 'No roles');
            })
            .catch(error => console.error('Error loading user data:', error));
    }

    $(document).on('click', '.edit-user', function () {
        const userId = $(this).data('id');
        fetch(`/api/admin/users/${userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch user');
                }
                return response.json();
            })
            .then(user => {
                $('#editId').val(user.id);
                $('#editFirstName').val(user.firstName);
                $('#editLastName').val(user.lastName);
                $('#editAge').val(user.age);
                $('#editEmail').val(user.email);
                $('#editPassword').val('');
                $('#editRoles').val(user.roles.map(r => r.id));
                $('#editUserModal').modal('show');
            })
            .catch(error => console.error('Error loading user for edit:', error));
    });

    $(document).on('click', '.delete-user', function () {
        const userId = $(this).data('id');
        fetch(`/api/admin/users/${userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch user');
                }
                return response.json();
            })
            .then(user => {
                $('#deleteId').text(user.id);
                $('#deleteName').text(`${user.firstName} ${user.lastName}`);
                $('#deleteEmail').text(user.email);
                $('#deleteRoles').text(user.roles.map(r => r.name).join(', '));
                $('#deleteUserModal').modal('show');
                $('#confirmDelete').data('id', userId);
            })
            .catch(error => console.error('Error loading user for delete:', error));
    });

    $(document).on('click', '#saveNewUser', function () {
        const userData = {
            firstName: $('#addFirstName').val(),
            lastName: $('#addLastName').val(),
            age: parseInt($('#addAge').val()) || null,
            email: $('#addEmail').val(),
            password: $('#addPassword').val(),
            roles: $('#addRoles').val().map(id => ({ id: parseInt(id) }))
        };
        clearErrors('#addUserForm');
        if (!userData.roles.length) {
            $('#addRolesError').text('At least one role is required');
            return;
        }
        fetch('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw err; });
                }
                return response.json();
            })
            .then(() => {
                $('#addUserModal').modal('hide');
                $('#addUserForm')[0].reset();
                loadAdminData();
            })
            .catch(error => {
                console.error('Error adding user:', error);
                displayErrors('#addUserForm', error);
            });
    });

    $(document).on('click', '#saveEditedUser', function () {
        const userData = {
            id: $('#editId').val(),
            firstName: $('#editFirstName').val(),
            lastName: $('#editLastName').val(),
            age: parseInt($('#editAge').val()) || null,
            email: $('#editEmail').val(),
            password: $('#editPassword').val() || null,
            roles: $('#editRoles').val().map(id => ({ id: parseInt(id) }))
        };
        clearErrors('#editUserForm');
        fetch(`/api/admin/users/${userData.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw err; });
                }
                return response.json();
            })
            .then(() => {
                $('#editUserModal').modal('hide');
                $('#editUserForm')[0].reset();
                loadAdminData();
            })
            .catch(error => {
                console.error('Error updating user:', error);
                displayErrors('#editUserForm', error);
            });
    });

    $(document).on('click', '#confirmDelete', function () {
        const userId = $(this).data('id');
        fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to delete user: ${response.status}`);
                }
                $('#deleteUserModal').modal('hide');
                loadAdminData();
            })
            .catch(error => console.error('Error deleting user:', error));
    });

    function clearErrors(formId) {
        $(`${formId} .text-danger`).text('');
    }

    function displayErrors(formId, error) {
        if (error.errors) {
            error.errors.forEach(err => {
                $(`${formId} #${err.field}Error`).text(err.defaultMessage);
            });
        } else {
            const message = error.message || 'An unexpected error occurred';
            alert('Error: ' + message);
        }
    }
});