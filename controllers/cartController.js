const Cart = require('../models/Cart');
const Book = require('../models/Book');

exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.book');
    if (!cart) return res.json({ success: true, items: [], totalPrice: 0, totalItems: 0 });
    res.json({
      success: true,
      items: cart.items,
      totalPrice: cart.totalPrice,
      totalItems: cart.totalItems,
    });
  } catch (err) {
    next(err);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { bookId, quantity = 1 } = req.body;
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    if (book.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Not enough stock available' });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = await Cart.create({ user: req.user.id, items: [] });

    const existingItem = cart.items.find((i) => i.book.toString() === bookId);
    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      cart.items.push({ book: bookId, quantity: Number(quantity) });
    }
    await cart.save();
    await cart.populate('items.book');

    res.json({
      success: true,
      message: 'Added to cart',
      totalItems: cart.totalItems,
      totalPrice: cart.totalPrice,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.find((i) => i.book.toString() === req.params.bookId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not in cart' });

    item.quantity = Number(quantity);
    await cart.save();
    await cart.populate('items.book');

    res.json({
      success: true,
      message: 'Cart updated',
      totalItems: cart.totalItems,
      totalPrice: cart.totalPrice,
    });
  } catch (err) {
    next(err);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items = cart.items.filter((i) => i.book.toString() !== req.params.bookId);
    await cart.save();
    await cart.populate('items.book');

    res.json({
      success: true,
      message: 'Item removed from cart',
      totalItems: cart.totalItems,
      totalPrice: cart.totalPrice,
    });
  } catch (err) {
    next(err);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });
    res.json({ success: true, message: 'Cart cleared', totalItems: 0, totalPrice: 0 });
  } catch (err) {
    next(err);
  }
};
