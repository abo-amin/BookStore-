require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Book = require('./models/Book');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const users = [
  { name: 'Admin User', email: 'admin@bookstore.com', password: 'password123', role: 'admin' },
  { name: 'John Doe', email: 'john@example.com', password: 'password123', role: 'user' }
];

const books = [
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    description: 'A novel about the American Dream.',
    price: 15.99,
    category: 'Fiction',
    stock: 50,
    featured: true,
    rating: 4.8,
    numReviews: 120,
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop'
  },
  {
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    description: 'Cosmology for everyone.',
    price: 18.50,
    category: 'Science',
    stock: 30,
    featured: true,
    rating: 4.9,
    numReviews: 85,
    coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop'
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    description: 'A handbook of agile software craftsmanship.',
    price: 45.00,
    category: 'Technology',
    stock: 100,
    featured: false,
    rating: 4.7,
    numReviews: 210,
    coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600&auto=format&fit=crop'
  }
];

const importData = async () => {
  try {
    await User.deleteMany();
    await Book.deleteMany();

    // Hash passwords before creating users
    for (const u of users) {
      const salt = await bcrypt.genSalt(10);
      u.password = await bcrypt.hash(u.password, salt);
    }
    await User.insertMany(users);
    await Book.insertMany(books);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

connectDB().then(importData);
