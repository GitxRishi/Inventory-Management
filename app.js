// Elements
const productList = document.getElementById('product-list');
const addProductForm = document.getElementById('add-product-form');
const addProductBtn = document.getElementById('add-product-btn');

// State to manage products and editing
let products = [];
let isEditing = false;
let editingProductId = null;

// Base URL
const baseURL = 'https://fakestoreapi.com/products';

// Fetch products on page load (GET Request)
async function fetchProducts() {
  try {
    const response = await fetch(baseURL);
    products = await response.json();  // Store fetched products in the global array
    displayProducts(products);
  } catch (error) {
    Swal.fire('Error', 'Failed to fetch products', 'error');
  }
}

// Display products in cards
function displayProducts(products) {
  productList.innerHTML = ''; // Clear current products
  products.forEach(product => {
    const productCard = document.createElement('div');
    productCard.classList.add('border', 'p-4', 'rounded', 'bg-white', 'shadow', 'product-card');
    productCard.setAttribute('data-id', product.id);

    productCard.innerHTML = `
      <img src="${product.image}" alt="${product.title}" class="w-full h-32 object-cover mb-2">
      <h3 class="text-lg font-bold">${product.title}</h3>
      <p>Price: $${product.price}</p>
      <p>${product.description}</p>
      <button class="bg-red-500 text-white px-4 py-2 rounded mt-2 delete-product" data-id="${product.id}">Delete</button>
      <button class="bg-yellow-500 text-white px-4 py-2 rounded mt-2 edit-product" data-id="${product.id}">Edit</button>
    `;

    productList.appendChild(productCard);
  });

  // Attach delete event to buttons
  document.querySelectorAll('.delete-product').forEach(button => {
    button.addEventListener('click', deleteProduct);
  });

  // Attach edit event to buttons
  document.querySelectorAll('.edit-product').forEach(button => {
    button.addEventListener('click', editProduct);
  });
}

// Add new product (POST Request)
addProductBtn.addEventListener('click', async () => {
  const name = document.getElementById('product-name').value;
  const price = document.getElementById('product-price').value;
  const description = document.getElementById('product-description').value;

  if (!name || !price || !description) {
    Swal.fire('Error', 'Please fill out all fields', 'error');
    return;
  }

  if (isEditing) {
    updateProduct(editingProductId);
    return;
  }

  const newProduct = {
    title: name,
    price: price,
    description: description,
    image: 'https://picsum.photos/200', // Random image
  };

  try {
    const response = await fetch(baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newProduct),
    });
    const product = await response.json();
    products.push(product);  // Add new product to the list
    displayProducts(products);  // Re-render products
    resetForm();
    Swal.fire('Success', 'Product added successfully', 'success');
  } catch (error) {
    Swal.fire('Error', 'Failed to add product', 'error');
  }
});

// Delete product (DELETE Request)
async function deleteProduct(e) {
  const id = e.target.getAttribute('data-id');

  Swal.fire({
    title: 'Are you sure?',
    text: "This product will be deleted!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await fetch(`${baseURL}/${id}`, { method: 'DELETE' });
        products = products.filter((product) => product.id !== parseInt(id));  // Remove the product from the list
        displayProducts(products);  // Re-render products
        Swal.fire('Deleted!', 'Product has been deleted.', 'success');
      } catch (error) {
        Swal.fire('Error', 'Failed to delete product', 'error');
      }
    }
  });
}

// Edit product (PUT Request)
async function editProduct(e) {
  const id = e.target.getAttribute('data-id');
  const product = products.find((product) => product.id === parseInt(id));

  document.getElementById('product-name').value = product.title;
  document.getElementById('product-price').value = product.price;
  document.getElementById('product-description').value = product.description;

  isEditing = true;
  editingProductId = id;

  // Change the "Add Product" button to "Update Product"
  addProductBtn.textContent = 'Update Product';
}

// Update product function (PUT Request)
async function updateProduct(id) {
  const updatedProduct = {
    title: document.getElementById('product-name').value,
    price: document.getElementById('product-price').value,
    description: document.getElementById('product-description').value,
    image: 'https://picsum.photos/200',
  };

  try {
    await fetch(`${baseURL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProduct),
    });

    products = products.map((product) => 
      product.id === parseInt(id) ? { ...product, ...updatedProduct } : product
    );

    Swal.fire('Success', 'Product updated successfully', 'success');
    displayProducts(products);  // Re-render products
    resetForm();
  } catch (error) {
    Swal.fire('Error', 'Failed to update product', 'error');
  }
}

// Reset form to initial state
function resetForm() {
  addProductForm.reset();
  addProductBtn.textContent = 'Add Product';
  isEditing = false;
  editingProductId = null;
}

// Load products on page load
fetchProducts();
