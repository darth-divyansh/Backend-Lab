
// const mongoose = require('mongoose');
// const User = require('./model/User');
// const express = require('express');
// const bodyParser = require('body-parser');
// const Joi = require('joi');  // Import Joi
// const multer = require('multer');  // Import Multer
// const path = require('path');
// const twilio = require('twilio'); // Import Twilio
// const { TwitterApi } = require('twitter-api-v2'); // Import Twitter API client

// // Twilio Credentials
// const TWILIO_ACCOUNT_SID = 'AC34e604c6721f50d6354750a970ca7079';
// const TWILIO_AUTH_TOKEN = '597bd326abdeafe24c03c02a635f4308';
// const TWILIO_SERVICE_SID = 'VA2aec219fafee2c3dfd046ac2f09b2a26';

// const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// // Initialize Twitter API client with Bearer Token
// // const twitterClient = new TwitterApi('AAAAAAAAAAAAAAAAAAAAAL%2BpwAEAAAAA9vSmFPMBKSS4U83LlEAa2%2FFlcG0%3DLqmOsdPaN4xXj6qSrOUlwF6rWpdeZ0QEDzdqkhQLbKlsqcxUwg');

// // MongoDB Schema for storing image
// const ImageSchema = new mongoose.Schema({
//     imageName: { type: String, required: true },
//     imageData: { type: Buffer, required: true },
//     contentType: { type: String, required: true }
// });

// const ImageModel = mongoose.model('Image', ImageSchema);

// const app = express();
// const port = 3002;

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // Connect to MongoDB
// mongoose.connect('mongodb://127.0.0.1:27017/demo')
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.log('MongoDB connection error:', err));

// // Joi schema for validation
// const userSchema = Joi.object({
//     name: Joi.string().min(4).required().messages({
//         'string.min': 'Name must be at least 4 characters',
//         'any.required': 'Name is required'
//     }),
//     dob: Joi.date().required().messages({
//         'date.base': 'Date of Birth is required',
//         'any.required': 'Date of Birth is required'
//     }),
//     location: Joi.string().required().messages({
//         'any.required': 'Location is required'
//     }),
//     subject: Joi.string().required().messages({
//         'any.required': 'Subject is required'
//     }),
//     phoneNumber: Joi.string().required().messages({
//         'any.required': 'Phone number is required'
//     }),
//     otpCode: Joi.string().required().messages({
//         'any.required': 'OTP code is required'
//     }),
//     imagePath: Joi.string().optional().messages({
//         'string.base': 'Image path must be a string'
//     })
// });

// // Multer configuration for file upload
// const storage = multer.memoryStorage(); // Store file in memory as buffer

// const upload = multer({
//     storage: storage,
//     fileFilter: (req, file, cb) => {
//         if (file.mimetype === 'image/jpeg') {
//             cb(null, true);
//         } else {
//             cb(new Error('Only JPG files are allowed'), false);
//         }
//     },
//     limits: {
//         fileSize: 1024 * 50 // Max 50KB
//     }
// });

// // Endpoint to trigger 2FA by sending OTP
// app.post('/send-otp', async (req, res) => {
//     const { phoneNumber } = req.body;

//     if (!phoneNumber) {
//         return res.status(400).json({ message: 'Phone number is required' });
//     }

//     try {
//         await client.verify.services(TWILIO_SERVICE_SID)
//             .verifications
//             .create({ to: phoneNumber, channel: 'sms' });

//         res.status(200).json({ message: `OTP sent to ${phoneNumber}` });
//     } catch (err) {
//         console.log('Error sending OTP:', err);
//         res.status(500).json({ message: 'Failed to send OTP', error: err.message });
//     }
// });

// // Endpoint to verify OTP
// app.post('/verify-otp', async (req, res) => {
//     const { phoneNumber, otpCode } = req.body;

//     if (!phoneNumber || !otpCode) {
//         return res.status(400).json({ message: 'Phone number and OTP code are required' });
//     }

//     try {
//         const verificationCheck = await client.verify.services(TWILIO_SERVICE_SID)
//             .verificationChecks
//             .create({ to: phoneNumber, code: otpCode });

//         if (verificationCheck.status === 'approved') {
//             res.status(200).json({ message: 'Phone number verified successfully' });
//         } else {
//             res.status(400).json({ message: 'Invalid OTP. Please try again.' });
//         }
//     } catch (err) {
//         console.log('Error verifying OTP:', err);
//         res.status(500).json({ message: 'Failed to verify OTP', error: err.message });
//     }
// });

// // Create User with validation and image upload
// app.post('/submit-form', upload.single('media'), async (req, res) => {
//     const { name, dob, location, subject, phoneNumber, otpCode } = req.body;

//     // Validate OTP before proceeding with registration
//     try {
//         const verificationCheck = await client.verify.services(TWILIO_SERVICE_SID)
//             .verificationChecks
//             .create({ to: phoneNumber, code: otpCode });

//         if (verificationCheck.status !== 'approved') {
//             return res.status(400).json({ message: 'Invalid OTP. Please verify your phone number.' });
//         }
//     } catch (err) {
//         return res.status(500).json({ message: 'Failed to verify OTP', error: err.message });
//     }

//     // Validate user input (Joi schema)
//     const { error } = userSchema.validate({
//         name,
//         dob,
//         location,
//         subject,
//         phoneNumber,
//         otpCode,
//         imagePath: req.file ? req.file.originalname : undefined
//     });

//     if (error) {
//         return res.status(400).json({ message: error.details[0].message });
//     }

//     if (!req.file) {
//         return res.status(400).json({ message: 'Media file is required and must be a JPG between 5KB and 50KB' });
//     }

//     try {
//         // Create and save the image in MongoDB
//         const newImage = new ImageModel({
//             imageName: req.file.originalname,
//             imageData: req.file.buffer,
//             contentType: req.file.mimetype
//         });

//         const savedImage = await newImage.save();

//         // Create the user and include the image path
//         const userDoc = await User.create({
//             name,
//             dob,
//             location,
//             subject,
//             imagePath: savedImage._id
//         });

//         res.json({ user: userDoc, image: 'Image uploaded successfully' });
//     } catch (err) {
//         console.log('Error:', err);
//         res.status(400).json(err);
//     }
// });



// // Endpoint to fetch tweets by username
// // app.get('/tweets/:username', async (req, res) => {
// //     const username = req.params.username;

// //     try {
// //         // Fetch user details by username
// //         const user = await twitterClient.v2.userByUsername(username);
        
// //         // Fetch the user's tweets
// //         const tweets = await twitterClient.v2.userTimeline(user.data.id);

// //         // Respond with the fetched tweets
// //         res.status(200).json({
// //             message: 'Fetched tweets successfully',
// //             tweets: tweets.data,
// //         });
// //     } catch (error) {
// //         console.error('Failed to fetch tweets:', error);
// //         // Handle errors appropriately
// //         res.status(500).json({
// //             message: 'Failed to fetch tweets',
// //             error: error.message || error,
// //         });
// //     }
// // });


// // Serve HTML file
// app.get('/stuReg', (req, res) => {
//     res.sendFile(path.join(__dirname, 'index.html'));
// });

// // Retrieve the image by ID
// app.get('/images/:id', async (req, res) => {
//     try {
//         const image = await ImageModel.findById(req.params.id);
//         if (!image) {
//             return res.status(404).json({ message: 'Image not found' });
//         }

//         res.contentType(image.contentType);
//         res.send(image.imageData);
//     } catch (err) {
//         console.log('Error:', err);
//         res.status(400).json(err);
//     }
// });

// app.listen(port, () => {
//     console.log(`Server listening at http://localhost:${port}`);
// });










// const accountSid = 'AC1550279dfedf5f4922265e962cb7b8f5"; // Replace with your actual Twilio Account SID
// const authToken = '0c90049adba6573b39efbf2b4287a660'; // Replace with your actual Twilio Auth Token
// client.verify.v2.services('VA02919cb33c3a28f1ebdfc72f7e47e6bd') // Replace with your actual Service SID






const mongoose = require('mongoose');
const User = require('./model/User');
const express = require('express');
const bodyParser = require('body-parser');
const Joi = require('joi');  // Import Joi
const multer = require('multer');  // Import Multer
const path = require('path');
const fs = require('fs');
const twilio = require('twilio'); // Import Twilio
// const { TwitterApi } = require('twitter-api-v2'); // Import Twitter API client

// Twilio Credentials
const TWILIO_ACCOUNT_SID = 'AC34e604c6721f50d6354750a970ca7079'; //Mine 

const TWILIO_AUTH_TOKEN = '597bd326abdeafe24c03c02a635f4308'; //Mine

const TWILIO_SERVICE_SID = 'VA2aec219fafee2c3dfd046ac2f09b2a26'; //Mine

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Create 'uploads' directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Multer configuration for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir); // Store files in the 'uploads' folder
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // Name the file with a unique identifier
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg') {
            cb(null, true);
        } else {
            cb(new Error('Only JPG files are allowed'), false);
        }
    },
    limits: {
        fileSize: 1024 * 50 // Max 50KB
    }
});

// MongoDB Schema for storing image
const ImageSchema = new mongoose.Schema({
    imageName: { type: String, required: true },
    imageData: { type: Buffer, required: true },
    contentType: { type: String, required: true }
});

const ImageModel = mongoose.model('Image', ImageSchema);

const app = express();
const port = 3002;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/demo')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Joi schema for validation
const userSchema = Joi.object({
    name: Joi.string().min(4).required().messages({
        'string.min': 'Name must be at least 4 characters',
        'any.required': 'Name is required'
    }),
    dob: Joi.date().required().messages({
        'date.base': 'Date of Birth is required',
        'any.required': 'Date of Birth is required'
    }),
    location: Joi.string().required().messages({
        'any.required': 'Location is required'
    }),
    subject: Joi.string().required().messages({
        'any.required': 'Subject is required'
    }),
    phoneNumber: Joi.string().required().messages({
        'any.required': 'Phone number is required'
    }),
    otpCode: Joi.string().required().messages({
        'any.required': 'OTP code is required'
    }),
    imagePath: Joi.string().optional().messages({
        'string.base': 'Image path must be a string'
    })
});

// Endpoint to trigger 2FA by sending OTP
app.post('/send-otp', async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(400).json({ message: 'Phone number is required' });
    }

    try {
        await client.verify.v2.services(TWILIO_SERVICE_SID)
            .verifications
            .create({ to: phoneNumber, channel: 'sms' });

        res.status(200).json({ message: `OTP sent to ${phoneNumber}` });
    } catch (err) {
        console.log('Error sending OTP:', err);
        res.status(500).json({ message: 'Failed to send OTP', error: err.message });
    }
});

// Endpoint to verify OTP
app.post('/verify-otp', async (req, res) => {
    const { phoneNumber, otpCode } = req.body;

    if (!phoneNumber || !otpCode) {
        return res.status(400).json({ message: 'Phone number and OTP code are required' });
    }

    try {
        const verificationCheck = await client.verify.v2.services(TWILIO_SERVICE_SID)
            .verificationChecks
            .create({ to: phoneNumber, code: otpCode });

        if (verificationCheck.status === 'approved') {
            res.status(200).json({ message: 'Phone number verified successfully' });
        } else {
            res.status(400).json({ message: 'Invalid OTP. Please try again.' });
        }
    } catch (err) {
        console.log('Error verifying OTP:', err);
        res.status(500).json({ message: 'Failed to verify OTP', error: err.message });
    }
});

// Create User with validation and image upload
app.post('/submit-form', upload.single('media'), async (req, res) => {
    const { name, dob, location, subject, phoneNumber, otpCode } = req.body;

    // Validate OTP before proceeding with registration
    try {
        const verificationCheck = await client.verify.v2.services(TWILIO_SERVICE_SID)
            .verificationChecks
            .create({ to: phoneNumber, code: otpCode });

        if (verificationCheck.status !== 'approved') {
            return res.status(400).json({ message: 'Invalid OTP. Please verify your phone number.' });
        }
    } catch (err) {
        return res.status(500).json({ message: 'Failed to verify OTP', error: err.message });
    }

    // Validate user input (Joi schema)
    const { error } = userSchema.validate({
        name,
        dob,
        location,
        subject,
        phoneNumber,
        otpCode,
        imagePath: req.file ? req.file.filename : undefined
    });

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    if (!req.file) {
        return res.status(400).json({ message: 'Media file is required and must be a JPG between 5KB and 50KB' });
    }

    try {
        // Create and save the image in MongoDB
        const newImage = new ImageModel({
            imageName: req.file.filename,  // Save filename instead of original name
            imageData: req.file.buffer,
            contentType: req.file.mimetype
        });

        const savedImage = await newImage.save();

        // Create the user and include the image path
        const userDoc = await User.create({
            name,
            dob,
            location,
            subject,
            imagePath: savedImage._id // Save image reference as ID
        });

        res.json({ user: userDoc, image: 'Image uploaded successfully' });
    } catch (err) {
        console.log('Error:', err);
        res.status(400).json(err);
    }
});

// Serve HTML file
app.get('/stuReg', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Retrieve the image by ID
app.get('/images/:id', async (req, res) => {
    try {
        const image = await ImageModel.findById(req.params.id);
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        res.contentType(image.contentType);
        res.send(image.imageData);
    } catch (err) {
        console.log('Error:', err);
        res.status(400).json(err);
    }
});

app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);

    res.download(filePath, (err) => {
        if (err) {
            console.error('Error while sending file:', err);
            res.status(404).send('File not found');
        }
    });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});








