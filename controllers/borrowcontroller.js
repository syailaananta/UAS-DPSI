// controllers/borrowController.js
const db = require('../config');

const borrowBook = async (req, res) => {
  const { bookId, returnDate } = req.body;
  const userId = req.user.id;

  const bookRef = db.collection('books').doc(bookId);
  const bookDoc = await bookRef.get();
  if (!bookDoc.exists) return res.status(404).send('Book not found');

  const borrowedBooks = await db.collection('borrowed_books')
    .where('bookId', '==', bookId)
    .where('returned', '==', false)
    .get();
  if (!borrowedBooks.empty) return res.status(400).send('Book is already borrowed');

  await db.collection('borrowed_books').add({
    bookId,
    userId,
    returnDate: new Date(returnDate),
    returned: false,
    bookTitle: bookDoc.data().title
  });

  res.send('Book borrowed successfully');
};

const returnBook = async (req, res) => {
  const { bookId } = req.body;
  const userId = req.user.id;

  const borrowedBooks = await db.collection('borrowed_books')
    .where('bookId', '==', bookId)
    .where('userId', '==', userId)
    .where('returned', '==', false)
    .get();
  if (borrowedBooks.empty) return res.status(404).send('No borrowed book found for this user');

  const borrowedBookId = borrowedBooks.docs[0].id;
  const borrowedBookData = borrowedBooks.docs[0].data();
  const returnDate = new Date();

  await db.collection('borrowed_books').doc(borrowedBookId).update({
    returned: true,
    actualReturnDate: returnDate
  });

  const lateDays = Math.ceil((returnDate - borrowedBookData.returnDate.toDate()) / (1000 * 60 * 60 * 24));
  const finePerDay = 1000; // Example fine rate
  const fine = lateDays > 0 ? lateDays * finePerDay : 0;

  if (fine > 0) {
    await db.collection('fines').add({
      userId,
      bookId,
      fine,
      paid: false
    });
    res.send(`Book returned. Fine of ${fine} IDR for late return.`);
  } else {
    res.send('Book returned successfully.');
  }
};

const getUserBorrowedBooks = async (req, res) => {
  const userId = req.user.id;
  const borrowedBooks = await db.collection('borrowed_books')
    .where('userId', '==', userId)
    .get();

  const borrowedBookList = [];
  borrowedBooks.forEach(doc => borrowedBookList.push({ id: doc.id, ...doc.data() }));

  res.send(borrowedBookList);
};

const getUserFines = async (req, res) => {
  const userId = req.user.id;
  const fines = await db.collection('fines')
    .where('userId', '==', userId)
    .where('paid', '==', false)
    .get();

  const fineList = [];
  fines.forEach(doc => fineList.push({ id: doc.id, ...doc.data() }));

  res.send(fineList);
};

const payFine = async (req, res) => {
  const { fineId } = req.body;

  await db.collection('fines').doc(fineId).update({ paid: true });
  res.send('Fine paid successfully.');
};

module.exports = {
  borrowBook,
  returnBook,
  getUserBorrowedBooks,
  getUserFines,
  payFine
};
