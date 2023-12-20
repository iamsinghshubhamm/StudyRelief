const express = require('express');
const app = express();
const {connectDB} = require('./Config/Database');
require('dotenv').config();
const { imageUploadCloudinary } = require('./utils/imageUpload');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

// Routes
const route = require('./Routes/routes');
app.use('/api/v1', route);

// Route for handling file uploads
// app.post('/upload', async (req, res) => {
//   try {
//     if (!req.files || Object.keys(req.files).length === 0) {
//       return res.status(400).json({ error: 'No files were uploaded.' });
//     }

//     const file = req.files.file; // Assuming the field name is 'file'
//     const result = await imageUploadCloudinary(file, 'your-folder', 300, 80);

//     res.json(result);
//   } catch (error) {
//     console.error('Error handling file upload:', error);
//     res.status(500).json({ error: 'Error uploading file to Cloudinary' });
//   }
// });

// Default route for testing server status
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: 'Your server is up and running....',
  });
});

// Start the server
const startServer = async () => {
  try {
    await connectDB();
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  }
};

startServer();
