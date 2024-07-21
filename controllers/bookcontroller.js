// controllers/bookController.js
const db = require('../config');

const addBook = async (req, res) => {
  const { id, title, author, isbn, publishedDate } = req.body;
  await db.collection('books').add({ id,title, author, isbn, publishedDate });
  res.send('Book added');
};

const updateBook = async (req, res) => {
  const { id } = req.params;
  const { title, author, isbn, publishedDate } = req.body;

  const bookRef = db.collection('books').doc(id);
  await bookRef.update({ title, author, isbn, publishedDate });
  res.send('Book updated');
};

const deleteBook = async (req, res) => {
  const { id } = req.params;

  const bookRef = db.collection('books').doc(id);
  await bookRef.delete();
  res.send('Book deleted');
};

const getBookCatalog = async (req, res) => {
  const books = await db.collection('books').get();
  const bookList = [];
  books.forEach(doc => bookList.push({ id: doc.id, ...doc.data() }));
  res.send(bookList);
};

const trackLateReturns = async (req, res) => {
  const currentDate = new Date();
  const lateBooks = await db.collection('borrowed_books')
    .where('returnDate', '<', currentDate)
    .where('returned', '==', false)
    .get();

  const lateBookList = [];
  lateBooks.forEach(doc => lateBookList.push({ id: doc.id, ...doc.data() }));

  res.send(lateBookList);
};

const notifyLateReturns = async (req, res) => {
  const currentDate = new Date();
  const lateBooks = await db.collection('borrowed_books')
    .where('returnDate', '<', currentDate)
    .where('returned', '==', false)
    .get();

  const finePerDay = 1000; // Example fine rate
  const notifications = [];

  lateBooks.forEach(doc => {
    const data = doc.data();
    const lateDays = Math.ceil((currentDate - data.returnDate.toDate()) / (1000 * 60 * 60 * 24));
    const fine = lateDays * finePerDay;

    notifications.push({
      userId: data.userId,
      message: `Your borrowed book "${data.bookTitle}" is late by ${lateDays} days. Your fine is ${fine} IDR.`
    });
  });

  // Save notifications to the database (or send via email/SMS)
  const batch = db.batch();
  notifications.forEach(notif => {
    const notifRef = db.collection('notifications').doc();
    batch.set(notifRef, notif);
  });
  await batch.commit();

  res.send('Notifications sent');
};

const generateBorrowingStats = async (req, res) => {
  const borrowedBooks = await db.collection('borrowed_books').get();

  const totalBorrowed = borrowedBooks.size;
  const members = new Set();
  borrowedBooks.forEach(doc => members.add(doc.data().userId));

  res.send({
    totalBorrowed,
    totalMembers: members.size
  });
};

const generateBookPopularityReport = async (req, res) => {
  const borrowedBooks = await db.collection('borrowed_books').get();

  const bookPopularity = {};
  borrowedBooks.forEach(doc => {
    const bookId = doc.data().bookId;
    if (!bookPopularity[bookId]) bookPopularity[bookId] = 0;
    bookPopularity[bookId]++;
  });

  const sortedBooks = Object.entries(bookPopularity).sort((a, b) => b[1] - a[1]);
  res.send(sortedBooks);
};

module.exports = {
  addBook,
  updateBook,
  deleteBook,
  getBookCatalog,
  trackLateReturns,
  notifyLateReturns,
  generateBorrowingStats,
  generateBookPopularityReport
};
