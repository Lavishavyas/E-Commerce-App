// A simple Express server to act as the backend for the E-commerce Dashboard.
// This server provides a RESTful API with CRUD operations for products.
// To run this file, save it as 'server.js' and execute 'node server.js' in your terminal.
// You will also need to have Node.js and the 'express' library installed.
// To install express, run 'npm install express'.

const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
// Use the environment variable for the port, or default to 3000 for local development.
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(cors()); // Allow cross-origin requests from the React app
app.use(express.json()); // Enable JSON body parsing

// Mock database (in-memory array)
let products = [
  { id: 1, name: "Luxury Perfume", price: 120, brand: "Scentful", category: "Fragrances", imageUrl: "https://placehold.co/400x400/1e293b/d1d5db?text=Perfume" },
  { id: 2, name: "Wireless Headphones", price: 250, brand: "AudioLux", category: "Electronics", imageUrl: "https://placehold.co/400x400/1e293b/d1d5db?text=Headphones" },
  { id: 3, name: "Premium Coffee Maker", price: 85, brand: "BrewMaster", category: "Appliances", imageUrl: "https://placehold.co/400x400/1e293b/d1d5db?text=Coffee+Maker" },
  { id: 4, name: "Ergonomic Office Chair", price: 350, brand: "ComfyHome", category: "Furniture", imageUrl: "https://placehold.co/400x400/1e293b/d1d5db?text=Chair" },
  { id: 5, name: "Smart Watch", price: 180, brand: "TimeTech", category: "Electronics", imageUrl: "https://placehold.co/400x400/1e293b/d1d5db?text=Watch" },
  { id: 6, name: "Wool Blanket", price: 95, brand: "CozyLiving", category: "Home Goods", imageUrl: "https://placehold.co/400x400/1e293b/d1d5db?text=Blanket" },
  { id: 7, name: "Leather Wallet", price: 60, brand: "StitchCraft", category: "Accessories", imageUrl: "https://placehold.co/400x400/1e293b/d1d5db?text=Wallet" },
  { id: 8, name: "Bluetooth Speaker", price: 110, brand: "AudioLux", category: "Electronics", imageUrl: "https://placehold.co/400x400/1e293b/d1d5db?text=Speaker" },
  { id: 9, name: "Chef's Knife Set", price: 220, brand: "CutleryCo", category: "Kitchenware", imageUrl: "https://placehold.co/400x400/1e293b/d1d5db?text=Knives" },
  { id: 10, name: "Vintage Camera", price: 450, brand: "PixelShot", category: "Electronics", imageUrl: "https://placehold.co/400x400/1e293b/d1d5db?text=Camera" },
  { id: 11, name: "Yoga Mat", price: 40, brand: "ZenithFit", category: "Sports & Fitness", imageUrl: "https://placehold.co/400x400/1e293b/d1d5db?text=Yoga+Mat" },
  { id: 12, name: "Stainless Steel Water Bottle", price: 25, brand: "EcoSip", category: "Home Goods", imageUrl: "https://placehold.co/400x400/1e293b/d1d5db?text=Water+Bottle" },
  { id: 13, name: "Digital Drawing Tablet", price: 300, brand: "Creativio", category: "Electronics", imageUrl: "https://placehold.co/400x400/1e293b/d1d5db?text=Tablet" },
  { id: 14, name: "Organic Tea Set", price: 55, brand: "Tealicious", category: "Food & Beverage", imageUrl: "https://placehold.co/400x400/1e293b/d1d5db?text=Tea+Set" },
  { id: 15, name: "Portable Power Bank", price: 70, brand: "PowerOn", category: "Electronics", imageUrl: "https://placehold.co/400x400/1e293b/d1d5db?text=Power+Bank" },
];

// Helper function for filtering and sorting
const applyFiltersAndSort = (data, filters, sort) => {
  let result = [...data];

  // Filtering
  if (filters.brand) {
    result = result.filter(p => p.brand.toLowerCase() === filters.brand.toLowerCase());
  }
  if (filters.category) {
    result = result.filter(p => p.category.toLowerCase() === filters.category.toLowerCase());
  }
  const min = parseFloat(filters.priceMin);
  const max = parseFloat(filters.priceMax);
  if (!isNaN(min)) {
    result = result.filter(p => p.price >= min);
  }
  if (!isNaN(max)) {
    result = result.filter(p => p.price <= max);
  }

  // NEW: Search by keyword
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    result = result.filter(p => 
      p.name.toLowerCase().includes(searchTerm) ||
      p.brand.toLowerCase().includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm)
    );
  }

  // Sorting
  result.sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price;
    if (sort === 'price-desc') return b.price - a.price;
    if (sort === 'brand-asc') return a.brand.localeCompare(b.brand);
    if (sort === 'brand-desc') return b.brand.localeCompare(a.brand);
    return 0;
  });

  return result;
};

// --- API Endpoints ---

// GET /api/products - Get all products with filters, sorting, and pagination
app.get('/api/products', (req, res) => {
  const { sort, page, limit, ...filters } = req.query;
  const filteredAndSorted = applyFiltersAndSort(products, filters, sort);

  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 9;
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedResult = filteredAndSorted.slice(startIndex, startIndex + limitNum);

  res.status(200).json({
    products: paginatedResult,
    total: filteredAndSorted.length
  });
});

// POST /api/products - Add a new product
app.post('/api/products', (req, res) => {
  const newProduct = req.body;
  if (!newProduct.name || !newProduct.price) {
    return res.status(400).send('Product name and price are required.');
  }

  const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
  const productToAdd = { ...newProduct, id: newId };
  products.push(productToAdd);
  res.status(201).json(productToAdd);
});

// PUT /api/products/:id - Update an existing product
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const updatedProduct = req.body;
  const index = products.findIndex(p => p.id === parseInt(id));

  if (index === -1) {
    return res.status(404).send('Product not found.');
  }

  products[index] = { ...products[index], ...updatedProduct, id: parseInt(id) };
  res.status(200).json(products[index]);
});

// DELETE /api/products/:id - Delete a product
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = products.length;
  products = products.filter(p => p.id !== parseInt(id));

  if (products.length === initialLength) {
    return res.status(404).send('Product not found.');
  }

  res.status(204).send(); // No content
});

// Start the server
app.listen(PORT, () => {
  console.log(`E-commerce API listening at http://localhost:${PORT}`);
});
