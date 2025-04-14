const express = require("express");
const bcrypt = require("bcrypt");
const User = require("./userModel");
const path = require("path");
const fs = require("fs");
const fileUpload = require("express-fileupload");
const router = express.Router();

const COLLECTION_FOLDER = path.join(__dirname, '/model/collection');
// Enable file upload
router.use(fileUpload({
    createParentPath: true, // Automatically create parent directories if they don't exist
}));

// Enable file upload
router.use(fileUpload({
    createParentPath: true, // Automatically create parent directories if they don't exist
}));

// Middleware to check if a user is authenticated before accessing certain routes
function isAuthorized(req, res, next) {
    if (req.session.isAuthenticated) {
        return next(); // If authenticated, proceed to the next middleware
    } else {
        res.status(401).json({error: "Unauthorized"}); // If not authenticated, return error
    }
}

router.get("/details", (req, res) => {
    try {
        // For normal login users
        if (req.session.username) {
            return res.status(200).json({username: req.session.username});
        }

        // For Google users
        if (req.session.googleUser) {
            return res.status(200).json({username: req.session.googleUser.username});
        }

        // If no session found
        return res.status(401).json({error: "User not authenticated"});
    } catch (error) {
        console.error("Error fetching user details:", error.message);
        return res.status(500).json({error: "Internal server error"});
    }
});


router.get("/check", (req, res) => {
    try {
        if (req.session.username) {
            return res.status(200).json({user: {username: req.session.username}});
        }
    } catch (error) {
        return res.status(404).json({Error: error})
    }
})


// User signup endpoint
router.post("/signup", async (req, res) => {
    const {username, email, password} = req.body;

    try {
        const existingUser = await User.findOne({$or: [{email}, {username}]});
        if (existingUser) {
            return res.status(400).json({error: "Username or Email already exists."});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userEntry = new User({
            username,
            email,
            password: hashedPassword,
        });

        await userEntry.save();
        return res.status(201).json({msg: `Successfully added ${username}`});
    } catch (error) {
        console.error("Error during signup:", error.message);
        return res.status(500).json({error: "Internal server error"});
    }
});

// User login endpoint
router.post("/login", async (req, res) => {
    const {username, password} = req.body;

    try {
        const user = await User.findOne({username});
        if (!user) {
            return res.status(400).json({error: "Invalid Username"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({error: "Invalid Password"});
        }

        req.session.username = username;
        req.session.userId = user._id;
        req.session.isAuthenticated = true;

        return res.status(200).json({
            msg: "Login successful.",
            user: {
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Error during login:", error.message);
        return res.status(500).json({error: "Internal server error"});
    }
});

// Google Signup/Login Endpoint
router.post("/google-signup", async (req, res) => {
    const {username, email} = req.body;

    try {
        let user = await User.findOne({email});

        // If the user does not exist, create a new Google user
        if (!user) {
            user = new User({
                username: username,
                email: email,
                password: null, // No password for Google users
            });
            await user.save();
        }

        // Use the same session fields as normal login
        req.session.username = user.username;
        req.session.userId = user._id;
        req.session.isAuthenticated = true;

        // Return the response similar to normal login
        return res.status(200).json({
            msg: "Login successful.",
            user: {
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Google Signup/Login Error:", error.message);
        return res.status(500).json({error: "Internal server error"});
    }
});


// Main endpoint accessible only to logged-in users
router.post("/main", isAuthorized, async (req, res) => {
    try {
        if (req.session.username) {
            // For normal login users
            return res.status(200).json({
                username: req.session.username,
                msg: "User authenticated via normal login",
            });
        } else if (req.session.googleUser) {
            // For Google users
            return res.status(200).json({
                username: req.session.googleUser.displayName,
                msg: "User authenticated via Google",
            });
        } else {
            throw new Error("Unauthorized");
        }
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
});

// Route to list processed images for a user
router.get('/collection/:username', (req, res) => {
    const {username} = req.params;
    const userFolder = path.join(COLLECTION_FOLDER, username);

    // Check if the user's folder exists
    if (!fs.existsSync(userFolder)) {
        return res.status(404).json({error: 'User collection folder does not exist'});
    }

    // Check if the folder is empty
    const files = fs.readdirSync(userFolder)
        .filter(file => fs.lstatSync(path.join(userFolder, file)).isFile());

    if (files.length === 0) {
        return res.status(200).json({msg: "Empty Folder"});
    }

    // If files exist, return their URLs
    const fileUrls = files.map(file => `http://localhost:8001/user/collection/${username}/${file}`);
    return res.json(fileUrls);
});

// Route to serve an individual processed image for a given user
router.get('/collection/:username/:filename', (req, res) => {
    const {username, filename} = req.params;
    const userFolder = path.join(COLLECTION_FOLDER, username);
    const filePath = path.join(userFolder, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).send('File does not exist');
    }

    res.sendFile(filePath);
});

// Route to rename (like) an image
router.post('/api/like-image', (req, res) => {
    const {username, oldSrc, newSrc} = req.body;

    if (!username || !oldSrc || !newSrc) {
        return res.status(400).json({error: 'Missing required data'});
    }

    const oldPath = path.join(COLLECTION_FOLDER, username, path.basename(oldSrc));
    const newPath = path.join(COLLECTION_FOLDER, username, path.basename(newSrc));

    if (!fs.existsSync(oldPath)) {
        return res.status(404).json({error: 'Original image does not exist'});
    }

    try {
        fs.renameSync(oldPath, newPath);
        res.json({message: 'Image renamed successfully'});
    } catch (error) {
        res.status(500).json({error: `Error renaming image: ${error.message}`});
    }
});

// Route to delete an image
router.delete('/api/delete-image', (req, res) => {
    const {username, filename} = req.body;

    if (!username || !filename) {
        return res.status(400).json({error: 'Username or filename missing'});
    }

    const userFolder = path.join(COLLECTION_FOLDER, username);
    const filePath = path.join(userFolder, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({error: `File does not exist: ${filePath}`});
    }

    try {
        fs.unlinkSync(filePath);
        res.json({message: `Image ${filename} deleted successfully`});
    } catch (error) {
        res.status(500).json({error: `Error deleting file: ${error.message}`});
    }
});
// User logout endpoint
router.post("/logout", isAuthorized, (req, res) => {
    if (req.session.username) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({error: "Failed to logout."});
            }
            res.clearCookie("connect.sid");
            return res.status(200).json({msg: "Logout successful."});
        });
    } else {
        return res.status(400).json({msg: "No user to log out."});
    }
});

module.exports = router;