$(document).ready(function () {
    $('#categoryForm').off('submit').on('submit', function (e) {
        e.preventDefault(); // Prevent form default submission
        saveCategory(); // Call the save function
    });

    loadCategories();
});

let products = [];
let orderItems = [];

// For managing Users
let users = [];

// For managing Categories
let categories = [];

// For managing Products in management pages
let productsForManagement = [];

/****************************************
 *          Helper Functions            *
 ****************************************/

// Fetch data from the API
function fetchData(url, method = 'GET', data = null) {
    const options = { method };

    if (data) {
        options.headers = {
            'Content-Type': 'application/json'
        };
        options.body = JSON.stringify(data);
    }

    return fetch(url, options).then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();
    });
}

/****************************************
 *           Index Page Logic           *
 ****************************************/

// Load products for the index page
function loadProducts() {
    fetchData('/api/Products')
        .then(data => {
            products = data;
            displayProducts();
        })
        .catch(error => console.error('Error fetching products:', error));
}

// Display products on the index page
function displayProducts() {
    const container = document.getElementById('productsContainer');
    container.innerHTML = '';
    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product');

        productDiv.innerHTML = `
            <h3>${product.name}</h3>
            <p>${product.description || 'No description'}</p>
            <p>Price: $${product.price.toFixed(2)}</p>
            <p>Stock: ${product.stock}</p>
            <button onclick="addToOrder(${product.id})">Add to Order</button>
        `;
        container.appendChild(productDiv);
    });
}

// Add product to order
function addToOrder(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Check if product is already in the order
    const existingItem = orderItems.find(item => item.productId === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        orderItems.push({
            productId: product.id,
            productName: product.name,
            quantity: 1,
            price: product.price
        });
    }
    displayOrderItems();
}

// Display order items
function displayOrderItems() {
    const orderList = document.getElementById('orderItemsList');
    orderList.innerHTML = '';

    orderItems.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.productName} - Quantity: ${item.quantity} - Price: $${(item.price * item.quantity).toFixed(2)}`;
        orderList.appendChild(listItem);
    });
}

// Create order
function createOrder() {
    if (orderItems.length === 0) {
        alert('Your order is empty.');
        return;
    }

    // Prompt user for username instead of userId
    const username = prompt('Enter your username:');
    if (!username) return;

    const order = {
        username: username,
        totalAmount: orderItems.reduce((total, item) => total + item.price * item.quantity, 0),
        address: '', // Assuming address is handled elsewhere or fetched from user data
        orderItems: orderItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
        }))
    };

    fetchData('/api/Orders', 'POST', order)
        .then(() => {
            alert('Order created successfully!');
            orderItems = [];
            displayOrderItems();
        })
        .catch(error => {
            console.error('Error creating order:', error);
            alert('Failed to create order.');
        });
}

// Event listeners for index page
if (document.getElementById('createOrderButton')) {
    document.getElementById('createOrderButton').addEventListener('click', createOrder);
    window.onload = loadProducts;
} +


    // Load orders
    function loadOrders() {
        fetchData('/api/Orders')
            .then(orders => {
                displayOrders(orders);
            })
            .catch(error => console.error('Error fetching orders:', error));
    }

// Display orders in the table
function displayOrders(orders) {
    const ordersTableBody = document.querySelector('#ordersTable tbody');
    ordersTableBody.innerHTML = '';

    orders.forEach(order => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.user ? order.user.username : 'Unknown'}</td>
            <td>${order.totalAmount.toFixed(2)}</td>
            <td>${new Date(order.orderDate).toLocaleDateString()}</td>
            <td>${order.address || ''}</td>
            <td>${order.orderItems.map(item => `${item.product.name} x ${item.quantity}`).join(', ')}</td>
        `;
        ordersTableBody.appendChild(row);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('ordersTable')) {
        loadOrders();
    }
});

/****************************************
 *          Users Management            *
 ****************************************/

// Load users
function loadUsers() {
    fetchData('/api/Users')
        .then(data => {
            users = data;
            displayUsers();
        })
        .catch(error => console.error('Error fetching users:', error));
}

// Display users in the table
function displayUsers() {
    const usersTableBody = document.querySelector('#usersTable tbody');
    usersTableBody.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.address || ''}</td>
            <td>
                <button onclick="editUser(${user.id})">Edit</button>
                <button onclick="deleteUser(${user.id})">Delete</button>
            </td>
        `;
        usersTableBody.appendChild(row);
    });
}

// Save user (create or update)
function saveUser(event) {
    event.preventDefault();

    const userId = $('#userId').val();
    const user = {
        id: userId ? parseInt(userId) : undefined, // Include id only for PUT
        username: $('#username').val().trim(),
        email: $('#email').val().trim(),
        address: $('#address').val().trim(),
        password: $('#password').val().trim()
    };

    const requestType = userId ? 'PUT' : 'POST';
    const requestUrl = userId ? `/api/Users/${userId}` : '/api/Users';

    $.ajax({
        url: requestUrl,
        type: requestType,
        contentType: 'application/json',
        data: JSON.stringify(user),
        success: function () {
            alert('User saved successfully!');
            $('#userForm')[0].reset();
            loadUsers();
        },
        error: function (jqXHR) {
            alert(`Error saving user: ${jqXHR.responseText || 'No response data'}`);
        }
    });
}

// Edit user
function editUser(userId) {
    fetchData(`/api/Users/${userId}`)
        .then(user => {
            document.getElementById('userId').value = user.id;
            document.getElementById('username').value = user.username;
            document.getElementById('email').value = user.email;
            document.getElementById('address').value = user.address || '';
        })
        .catch(error => console.error('Error fetching user:', error));
}

// Delete user
function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    fetchData(`/api/Users/${userId}`, 'DELETE')
        .then(() => {
            alert('User deleted successfully!');
            loadUsers();
        })
        .catch(error => {
            console.error('Error deleting user:', error);
            alert('Failed to delete user.');
        });
}

// Event listener for user form submission
document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('userForm')) {
        document.getElementById('userForm').addEventListener('submit', saveUser);
    }
    loadUsers();
});
/****************************************
 *        Categories Management         *
 ****************************************/

// Load categories
function loadCategories() {
    fetchData('/api/Categories')
        .then(data => {
            categories = data;
            displayCategories();
            populateCategoryDropdown(); // For products form
        })
        .catch(error => console.error('Error fetching categories:', error));
}

// Display categories in the table
function displayCategories() {
    const categoriesTableBody = document.querySelector('#categoriesTable tbody');
    categoriesTableBody.innerHTML = '';

    categories.forEach(category => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${category.id}</td>
            <td>${category.name}</td>
            <td>${category.description || ''}</td>
            <td>
                <button onclick="editCategory(${category.id})">Edit</button>
                <button onclick="deleteCategory(${category.id})">Delete</button>
            </td>
        `;
        categoriesTableBody.appendChild(row);
    });
}

// Save category (create or update)
function saveCategory() {
    const categoryId = $('#categoryId').val();
    const category = {
        id: categoryId ? parseInt(categoryId) : undefined,
        name: $('#categoryName').val(),
        description: $('#categoryDescription').val()
    };
    const requestType = categoryId ? 'PUT' : 'POST';
    const requestUrl = categoryId ? `/api/Categories/${categoryId}` : '/api/Categories';

    $.ajax({
        url: requestUrl,
        type: requestType,
        contentType: 'application/json',
        data: JSON.stringify(category),
        success: function () {
            alert('Kategorija je uspješno spremljena.');
            $('#categoryForm')[0].reset();
            loadCategories();
        },
        error: function (jqXHR) {
            alert(`Error saving category: ${jqXHR.responseText || 'No response data'}`);
        }
    });
}

// Edit category
function editCategory(categoryId) {
    $.getJSON(`/api/Categories/${categoryId}`)
        .then(category => {
            $('#categoryId').val(category.id);
            $('#categoryName').val(category.name);
            $('#categoryDescription').val(category.description || '');
        })
        .catch(error => console.error('Error fetching category:', error));
}

// Delete category
function deleteCategory(id) {
    $.ajax({
        url: `/api/Categories/${id}`,
        type: 'DELETE',
        success: function () {
            alert('Category deleted successfully.');
            loadCategories();
        },
        error: function (jqXHR) {
            alert(`Error deleting category: ${jqXHR.responseText || 'No response data'}`);
        }
    });
}

// Event listener for category form submission
if (document.getElementById('categoryForm')) {
    document.getElementById('categoryForm').addEventListener('submit', saveCategory);
    window.onload = loadCategories;
}

/****************************************
 *         Products Management          *
 ****************************************/

// Load products for management
function loadProductsForManagement() {
    fetchData('/api/Products')
        .then(data => {
            productsForManagement = data;
            displayProductsForManagement();
        })
        .catch(error => console.error('Error fetching products:', error));

    // Load categories for the category dropdown
    fetchData('/api/Categories')
        .then(data => {
            categories = data;
            populateCategoryDropdown();
        })
        .catch(error => console.error('Error fetching categories:', error));
}

// Display products in the table
function displayProductsForManagement() {
    const productsTableBody = document.querySelector('#productsTable tbody');
    productsTableBody.innerHTML = '';

    productsForManagement.forEach(product => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td>${product.category ? product.category.name : 'N/A'}</td>
            <td>
                <button onclick="editProduct(${product.id})">Edit</button>
                <button onclick="deleteProduct(${product.id})">Delete</button>
            </td>
        `;
        productsTableBody.appendChild(row);
    });
}

// Save product (create or update)
function saveProduct(event) {
    event.preventDefault();

    const productId = document.getElementById('productId').value;
    const product = {
        name: document.getElementById('productName').value.trim(),
        description: document.getElementById('productDescription').value.trim(),
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        categoryId: parseInt(document.getElementById('productCategoryId').value)
    };

    const method = productId ? 'PUT' : 'POST';
    const url = productId ? `/api/Products/${productId}` : '/api/Products';

    if (productId) {
        product.id = parseInt(productId);
    }

    fetchData(url, method, product)
        .then(() => {
            alert('Product saved successfully!');
            document.getElementById('productForm').reset();
            document.getElementById('productId').value = '';
            loadProductsForManagement();
        })
        .catch(error => {
            console.error('Error saving product:', error);
            alert('Failed to save product.');
        });
}

// Edit product
function editProduct(productId) {
    fetchData(`/api/Products/${productId}`)
        .then(product => {
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStock').value = product.stock;
            document.getElementById('productCategoryId').value = product.categoryId;
        })
        .catch(error => console.error('Error fetching product:', error));
}

// Delete product
function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    fetchData(`/api/Products/${productId}`, 'DELETE')
        .then(() => {
            alert('Product deleted successfully!');
            loadProductsForManagement();
        })
        .catch(error => {
            console.error('Error deleting product:', error);
            alert('Failed to delete product.');
        });
}

// Populate category dropdown in product form
function populateCategoryDropdown() {
    const categorySelect = document.getElementById('productCategoryId');
    if (!categorySelect) return;

    categorySelect.innerHTML = '<option value="">Select Category</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}

// Event listener for product form submission
if (document.getElementById('productForm')) {
    document.getElementById('productForm').addEventListener('submit', saveProduct);
    window.onload = () => {
        loadProductsForManagement();
        loadCategories();
    };
}

/****************************************
 *         Orders Management            *
 ****************************************/

