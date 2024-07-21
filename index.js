const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require("dotenv");
const cors = require('cors');
const  db  = require('./config'); // Require the config file
const app = express();
const router = express.Router();

const { authenticateToken, isLibrarian } = require('./middleware/auth');
const userController = require('./controllers/usercontroller');
const bookController = require('./controllers/bookcontroller');
const borrowController = require('./controllers/borrowcontroller');

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*', // Updated origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
dotenv.config();

// All routes here
// User routes
app.post('/register', userController.registerUser);
app.post('/login', userController.loginUser);

// Book routes
app.post('/books', bookController.addBook);
app.put('/books/:id', bookController.updateBook);
app.delete('/books/:id', bookController.deleteBook);
app.get('/books', bookController.getBookCatalog); // Get book catalog
app.get('/late-returns', bookController.trackLateReturns);
app.post('/notify-late-returns', bookController.notifyLateReturns);
app.get('/reports/borrowing-stats', bookController.generateBorrowingStats);
app.get('/reports/book-popularity', bookController.generateBookPopularityReport);

// Borrow routes
app.post('/borrow',  borrowController.borrowBook);
app.post('/return',  borrowController.returnBook);
app.get('/my-borrowed-books', authenticateToken, borrowController.getUserBorrowedBooks);
app.get('/my-fines', authenticateToken, borrowController.getUserFines);
app.post('/pay-fine', authenticateToken, borrowController.payFine);


const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Example route to demonstrate database connection
router.get('/test', async (req, res) => {
  try {
    const snapshot = await db.collection('testCollection').get();
    const data = snapshot.docs.map(doc => doc.data());
    res.json(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});
