const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const enquiryRoutes = require('./routes/enquiries');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        console.log('Ensure MongoDB is running locally on port 27017');
    });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/enquiries', enquiryRoutes);

app.get('/', (req, res) => {
    res.send('Structured Enquiry API Running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
