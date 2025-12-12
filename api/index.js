const express = require("express");
const app = express();
const multer = require('multer');
const cors = require('cors');

// Enable CORS for all routes
app.use(cors());
const upload = multer({ storage: multer.memoryStorage() });
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const fs = require('fs');
const path = require('path');

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res, next) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/sam3.pt', (req, res, next) => {
  res.redirect('https://huggingface.co/AB498/sam3/resolve/main/sam3.pt');
});

app.get('/vocab.txt.gz', (req, res, next) => {
  res.redirect('https://huggingface.co/AB498/sam3/resolve/main/bpe_simple_vocab_16e6.txt.gz');
});

// Grounding DINO API URLs for rotation
const GROUNDING_DINO_URLS = [
  "https://ab498-v1-grounding-dino-1.hf.space",
  "https://ab498-v1-grounding-dino-2.hf.space",
  "https://ab498-v1-grounding-dino-3.hf.space",
  "https://ab498-v1-grounding-dino-4.hf.space"
];

// Use Vercel's tmp directory for storing index file
const INDEX_FILE_PATH = `/tmp/grounding-dino-url-index.txt`;

let urlIndex = Number((() => {
  try {
    return fs.readFileSync(INDEX_FILE_PATH, 'utf8');
  } catch {
    return 0;
  }
})()) || 0;

console.log(`[GROUNDING_DINO] Using URL Index: ${urlIndex}`);

// Health check and warm-up function
const warmUpUrls = async () => {
  console.log('[GROUNDING_DINO] Warming up URLs...');

  for (let i = 0; i < GROUNDING_DINO_URLS.length; i++) {
    try {
      const url = GROUNDING_DINO_URLS[i];
      console.log(`[GROUNDING_DINO] Checking health of ${url}`);

      const response = await fetch(`${url}/health`, {
        method: 'GET',
        timeout: 5000 // 5 second timeout
      });

      if (response.ok) {
        console.log(`[GROUNDING_DINO] ${url} is healthy`);
      } else {
        console.log(`[GROUNDING_DINO] ${url} returned status ${response.status}`);
      }
    } catch (error) {
      console.log(`[GROUNDING_DINO] Error checking ${GROUNDING_DINO_URLS[i]}: ${error.message}`);
    }
  }

  console.log('[GROUNDING_DINO] Warm-up complete');
};

// New endpoint for Grounding DINO API with URL rotation
app.post('/label-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { text_prompt, box_threshold, text_threshold } = req.body;

    // Validate required parameters
    if (!text_prompt) {
      return res.status(400).json({ error: 'text_prompt is required' });
    }

    // Rotate to next URL
    const currentUrl = GROUNDING_DINO_URLS[urlIndex % GROUNDING_DINO_URLS.length];
    urlIndex = (urlIndex + 1) % GROUNDING_DINO_URLS.length;

    // Save the updated index to Vercel's tmp directory
    try {
      fs.writeFileSync(INDEX_FILE_PATH, urlIndex.toString());
    } catch (e) {
      console.log('[GROUNDING_DINO_ERROR] Failed to save URL index:', e);
    }

    console.log(`[GROUNDING_DINO] Using URL: ${currentUrl}`);

    // Prepare form data for forwarding
    const formData = new FormData();
    formData.append('image', req.file.buffer, {
      filename: 'image.jpg',
      contentType: req.file.mimetype
    });
    formData.append('text_prompt', text_prompt);

    // Set default thresholds if not provided
    formData.append('box_threshold', box_threshold || '0.35');
    formData.append('text_threshold', text_threshold || '0.25');

    // Forward request to Hugging Face Space
    const response = await fetch(`${currentUrl}/label_image`, {
      method: 'POST',
      body: formData,
      headers: {
        ...formData.getHeaders()
      }
    });

    const responseData = await response.json();
    res.json(responseData);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Failed to process image labeling request' });
  }
});

// Health endpoint
app.get('/health', async (req, res) => {
  await warmUpUrls();
  res.json({ status: 'healthy' });
});

module.exports = app;