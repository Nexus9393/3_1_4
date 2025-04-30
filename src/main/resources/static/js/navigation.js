console.log("navigation.js: Script loaded");

$(document).ready(function () {
    console.log("navigation.js: jQuery ready");
    let isAdmin = false;

    // Проверяем авторизацию и роли
    fetch('/api/user', { headers: { 'Cache-Control': 'no-cache' } })
        .then(response => {
            console.log("Fetch /api/user response status:", response.status);
            if (!response.ok) {
                console.log("User not authenticated, showing login form");
                $('#mainContent').html(getLoginFormHtml());
                $('#logoutLink').hide();
                $('#authInfo').text('');
                $('.sidebar').hide();
                $('#mainContentWrapper').addClass('col-md-12').removeClass('col-md-10');
                return null;
            }
            return response.json();
        })
        .then(user => {
            if (user) {
                console.log("Current user:", user);
                isAdmin = user.roles.some(role => role.name === 'ADMIN');
                $('#authInfo').text(`${user.email} with roles: ${user.roles.map(r => r.name).join(', ')}`);
                $('#logoutLink').show();
                $('.sidebar').show();
                $('#mainContentWrapper').addClass('col-md-10').removeClass('col-md-12');
                $('#mainContent').removeClass('main-content-centered');

                // Определяем начальную страницу
                const initialPage = window.location.pathname.split('/').pop() || 'user';
                console.log("Initial page:", initialPage);
                updateActiveTab(initialPage);
                if (initialPage === 'admin' && isAdmin) {
                    loadAdminPage();
                } else if (initialPage === 'user' || initialPage === 'login' || initialPage === '') {
                    loadUserPage();
                } else {
                    console.log("Redirecting to /user due to unauthorized access");
                    loadUserPage();
                }
            }
        })
        .catch(error => {
            console.error('Error checking user role:', error);
            $('#mainContent').html(getLoginFormHtml());
            $('#logoutLink').hide();
            $('#authInfo').text('');
            $('.sidebar').hide();
            $('#mainContentWrapper').addClass('col-md-12').removeClass('col-md-10');
        });

    $(document).on('click', '.sidebar a', function (e) {
        e.preventDefault();
        const page = $(this).data('page');
        console.log("Navigating to page:", page);
        if (page === 'admin' && !isAdmin) {
            alert("Access denied");
            return;
        }
        updateActiveTab(page);
        loadPageContent(page);
    });

    function updateActiveTab(page) {
        $('.sidebar a').removeClass('active');
        if (page === 'admin') {
            $('#adminTab').addClass('active');
        } else if (page === 'user') {
            $('#userTab').addClass('active');
        }
    }

    function loadPageContent(page) {
        if (page === 'admin') {
            loadAdminPage();
        } else {
            loadUserPage();
        }
    }

    function getLoginFormHtml() {
        return `
            <div class="login-form">
                <h2>Please sign in</h2>
                <div class="error-message" id="loginError"></div>
                <form id="loginForm" method="post" action="/login">
                    <div class="form-group">
                        <i class="fas fa-user" aria-hidden="true"></i>
                        <input type="text" name="username" placeholder="Email address" class="form-control" aria-label="Email address" required>
                    </div>
                    <div class="form-group">
                        <i class="fas fa-lock" aria-hidden="true"></i>
                        <input type="password" name="password" placeholder="Password" class="form-control" aria-label="Password" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Sign in</button>
                </form>
            </div>
        `;
    }

    function loadAdminPage() {
        console.log("Loading admin page");
        const adminHtml = `
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
        `;
        $('#mainContent').html(adminHtml);
        loadAdminData();
        history.pushState(null, null, '/admin');
    }

    function loadUserPage() {
        console.log("Loading user page");
        const userHtml = `
        <h1>User Page</h1>
        <div class="profile-card">
            <h2>User Information</h2>
            <table class="table table-striped" id="userTable" style="width: 80%; margin: 0 auto;">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Age</th>
                        <th>Email</th>
                        <th>Roles</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td id="userId"></td>
                        <td id="userFirstName"></td>
                        <td id="userLastName"></td>
                        <td id="userAge"></td>
                        <td id="userEmail"></td>
                        <td id="userRoles"></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
        $('#mainContent').html(userHtml);
        loadUserData();
        history.pushState(null, null, '/user');
    }

    function loadAdminData() {
        console.log("Loading admin data...");
        fetch('/api/admin/users')
            .then(response => {
                console.log("Fetch /api/admin/users response status:", response.status);
                if (response.status === 403) {
                    console.log("Access denied to /api/admin/users, redirecting to /login");
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
                        console.log("Fetch /api/admin/roles response status:", response.status);
                        if (response.status === 403) {
                            console.log("Access denied to /api/admin/roles, redirecting to /login");
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
                console.log("Fetch /api/user response status:", response.status);
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
        console.log("Editing user with ID:", userId);
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
        console.log("Deleting user with ID:", userId);
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
        console.log("Saving new user:", userData);
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
                console.log("Save new user response status:", response.status);
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
        console.log("Saving edited user:", userData);
        clearErrors('#editUserForm');
        fetch(`/api/admin/users/${userData.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        })
            .then(response => {
                console.log("Save edited user response status:", response.status);
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
        console.log("Confirming delete for user ID:", userId);
        fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE'
        })
            .then(response => {
                console.log("Delete user response status:", response.status);
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