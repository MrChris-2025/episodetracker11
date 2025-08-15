// index.js (or server.js) for your Replit Backend
// This code sets up a simple Node.js Express server to handle
// saving, retrieving, and deleting user episode progress.

// 1. Import necessary modules
const express = require('express'); // Express.js for creating the web server
const app = express(); // Create an Express application instance
const fs = require('fs').promises; // Node.js File System module for asynchronous file operations
const path = require('path'); // Node.js Path module for handling file paths

// 2. Middleware setup
// Enable Express to parse JSON formatted request bodies.
// This is crucial for receiving the progress data sent from your frontend.
app.use(express.json());

// 3. Define data storage path
// This is where your progress data will be stored on Replit's file system.
// It creates a file named 'progress.json' inside a '.data' directory
// within your Replit project. The '.data' directory is typically hidden
// but is persisted by Replit.
const DATA_FILE = path.join(__dirname, '.data', 'progress.json');

// 4. Helper function to load progress data
/**
 * Asynchronously loads all user progress data from the 'progress.json' file.
 * If the file doesn't exist (first run) or is unreadable/invalid JSON,
 * it safely returns an empty object to prevent errors.
 * @returns {Promise<Object>} A promise that resolves to the parsed progress data.
 */
async function loadProgress() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8'); // Read the file content as UTF-8 string
        return JSON.parse(data); // Parse the JSON string into a JavaScript object
    } catch (error) {
        // If the file does not exist (error.code === 'ENOENT'), it's a normal first-run scenario.
        // For other errors, log them for debugging purposes.
        if (error.code === 'ENOENT') {
            console.log("Progress file not found. Starting with empty progress data.");
            return {}; // Return an empty object if the file doesn't exist
        }
        console.error('Error loading progress from file:', error);
        return {}; // Return empty object on other errors to prevent crashes
    }
}

// 5. Helper function to save progress data
/**
 * Asynchronously saves the given progress data object to the 'progress.json' file.
 * It ensures the '.data' directory exists before writing.
 * @param {Object} progressData The JavaScript object containing all progress data to save.
 * @returns {Promise<void>} A promise that resolves when the data has been successfully written.
 */
async function saveProgress(progressData) {
    try {
        // Create the '.data' directory if it doesn't already exist.
        // `recursive: true` ensures that parent directories are also created if needed.
        await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
        // Write the JavaScript object back to the file as a JSON string.
        // `null, 2` formats the JSON with 2 spaces for readability.
        await fs.writeFile(DATA_FILE, JSON.stringify(progressData, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving progress to file:', error);
    }
}

// 6. CORS (Cross-Origin Resource Sharing) Middleware
/**
 * This middleware sets the necessary headers to allow your frontend (HTML file)
 * to communicate with this backend, even if they are on different domains or origins.
 * It also handles 'OPTIONS' preflight requests, which browsers send before certain
 * cross-origin requests (like POST or requests with custom headers).
 */
app.use((req, res, next) => {
    // Allow requests from your Netlify domain and localhost for development
    const allowedOrigins = [
        'https://episodetracker11.netlify.app', // Replace with your actual Netlify URL
        'http://localhost:3000', // For local development
        'http://127.0.0.1:3000'
    ];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    // Specifies which HTTP methods are allowed for cross-origin requests.
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE'); // Added DELETE
    // Specifies which headers are allowed in cross-origin requests.
    // 'Content-Type' is needed for JSON bodies, 'X-User-ID' is your custom header.
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-User-ID');

    // Handle 'OPTIONS' preflight requests. These are sent by browsers to check
    // CORS policy before making the actual request. We respond with a 204 No Content.
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next(); // Move to the next middleware or route handler
});

// 7. GET Route: Root path '/' (for direct access to the backend URL)
// This provides a friendly message if someone accesses the backend URL directly,
// instead of a "Cannot GET /" error.
app.get('/', (req, res) => {
    res.send('Welcome to the Episode Tracker API! Please use the frontend HTML application to interact.');
});


// 8. GET Route: Retrieve ALL saved progress for a specific user
app.get('/api/all-progress', async (req, res) => {
    const userId = req.headers['x-user-id'] || 'anonymous_user';

    const allUsersProgress = await loadProgress();
    const userAllProgress = allUsersProgress[userId] || {}; // Return all saved items for this user

    res.json(userAllProgress);
});


// 9. POST Route: Save Episode Progress
/**
 * Handles incoming POST requests to '/api/progress'.
 * This endpoint expects a JSON body with tmdbId, mediaType, episode (optional), and timestamp.
 * It saves this progress for a specific user (identified by 'X-User-ID' header).
 */
app.post('/api/progress', async (req, res) => {
    // Get the user ID from the 'X-User-ID' header.
    // If the header is missing, it defaults to 'anonymous_user' for simplicity in this example.
    const userId = req.headers['x-user-id'] || 'anonymous_user';
    // Destructure the expected data from the request body.
    const { tmdbId, mediaType, episode, timestamp } = req.body;

    // Basic validation to ensure essential data is provided.
    if (!tmdbId || !mediaType || typeof timestamp === 'undefined') {
        // Return a 400 Bad Request if required fields are missing.
        return res.status(400).json({ error: 'Missing required fields: tmdbId, mediaType, timestamp' });
    }

    // Load all current progress data for all users.
    const allUsersProgress = await loadProgress();

    // If this is a new user, initialize an empty object for their progress.
    if (!allUsersProgress[userId]) {
        allUsersProgress[userId] = {};
    }

    // Store or update the progress for the specific TMDB item under this user.
    allUsersProgress[userId][tmdbId] = { mediaType, episode, timestamp, lastUpdated: Date.now() };

    // Save the entire updated progress data back to the file.
    await saveProgress(allUsersProgress);

    // Send a success response back to the frontend with the saved progress details.
    res.json({ status: 'success', progress: allUsersProgress[userId][tmdbId] });
});

// 10. GET Route: Retrieve Episode Progress (for a single item)
/**
 * Handles incoming GET requests to '/api/progress/:tmdbId'.
 * This endpoint retrieves the last saved progress for a specific TMDB item
 * for a particular user (identified by 'X-User-ID' header).
 * ':tmdbId' is a URL parameter that will be extracted.
 */
app.get('/api/progress/:tmdbId', async (req, res) => {
    // Get the user ID from the 'X-User-ID' header.
    const userId = req.headers['x-user-id'] || 'anonymous_user';
    // Get the TMDb ID from the URL parameters (e.g., if request is /api/progress/123, tmdbId will be '123').
    const tmdbId = req.params.tmdbId;

    // Load all current progress data.
    const allUsersProgress = await loadProgress();
    // Attempt to retrieve the specific item's progress for this user.
    // If the user or item's progress isn't found, it will be null.
    const userProgress = allUsersProgress[userId] ? allUsersProgress[userId][tmdbId] : null;

    // Send the retrieved progress data as a JSON response.
    // Will be null if no progress is found.
    res.json(userProgress);
});


// --- NEW ENDPOINT FOR DELETING PROGRESS ---
// 11. DELETE Route: Delete episode progress for a specific item
app.delete('/api/progress/:tmdbId', async (req, res) => {
    const userId = req.headers['x-user-id'] || 'anonymous_user';
    const tmdbIdToDelete = req.params.tmdbId;

    const allUsersProgress = await loadProgress();

    if (allUsersProgress[userId] && allUsersProgress[userId][tmdbIdToDelete]) {
        delete allUsersProgress[userId][tmdbIdToDelete]; // Remove the item
        await saveProgress(allUsersProgress); // Save the updated data
        console.log(`Progress for TMDB ID ${tmdbIdToDelete} deleted for user ${userId}`);
        res.json({ status: 'success', message: 'Progress deleted successfully.' });
    } else {
        console.log(`No progress found for TMDB ID ${tmdbIdToDelete} for user ${userId} to delete.`);
        res.status(404).json({ error: 'Progress not found for this item.' });
    }
});
// --- END NEW ENDPOINT ---


// 12. Start the Server
// Tell the Express app to start listening for incoming requests.
// process.env.PORT is an environment variable set by Replit (and other hosting platforms)
// to specify which port your application should bind to.
const listener = app.listen(process.env.PORT, () => {
    console.log('Your app is listening on port ' + listener.address().port);
});
