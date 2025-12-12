const express = require("express");
const app = express();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res, next) => {
  res.send('Hello World!')
});
app.get('/sam3.pt', (req, res, next) => {
  res.redirect('https://huggingface.co/AB498/sam3/resolve/main/sam3.pt');
});

app.get('/vocab.txt.gz', (req, res, next) => {
  res.redirect('https://huggingface.co/AB498/sam3/resolve/main/bpe_simple_vocab_16e6.txt.gz');
});

// New endpoint for Grounding DINO API
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
    const response = await fetch('https://ab498-v1-grounding-dino-1.hf.space/label_image', {
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

module.exports = app;