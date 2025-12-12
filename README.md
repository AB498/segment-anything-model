# Image Labeling AI - Online Auto Annotation Service

A free online advanced AI image labeling service with auto annotation using SAM3 and Grounding DINO for precise object detection and labeling.

![Image Labeling AI Demo](https://imagelabeling.vercel.app/demo.png)

## Features

- 🤖 **AI-Powered Object Detection**: Uses cutting-edge Segment Anything Model 3 (SAM3) and Grounding DINO
- 🔍 **Zero-Shot Learning**: Describe objects in natural language to detect them in images
- ⚡ **Real-Time Processing**: Instant object detection and labeling results
- 🌐 **Online Service**: No installation required - works directly in your browser
- 💰 **Completely Free**: No cost to use our auto annotation service
- 📱 **Responsive Design**: Works on desktop and mobile devices

## How It Works

1. Upload an image or select a demo image
2. Enter a text prompt describing what objects you want to detect (e.g., "cat", "car", "person with hat")
3. Our AI automatically detects and labels the objects in your image
4. View bounding boxes and labels overlaid on your image

## Technology Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js with Express
- **AI Models**: 
  - [Segment Anything Model 3 (SAM3)](https://huggingface.co/AB498/sam3)
  - [Grounding DINO](https://huggingface.co/spaces/AB498/v1-Grounding-DINO-1)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/image-labeling-ai.git
   ```

2. Install dependencies:
   ```bash
   cd image-labeling-ai
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and visit `http://localhost:3000`

## API Endpoints

### POST /label-image

Label objects in an image using text prompts.

**Request:**
- Form data with:
  - `image`: Image file to analyze
  - `text_prompt`: Description of objects to detect
  - `box_threshold`: (Optional) Box confidence threshold (default: 0.35)
  - `text_threshold`: (Optional) Text confidence threshold (default: 0.25)

**Response:**
```json
{
  "boxes": [[x_center, y_center, width, height], ...],
  "phrases": ["object_label_1", "object_label_2", ...]
}
```

### GET /sam3.pt

Redirects to the SAM3 model weights on HuggingFace.

### GET /vocab.txt.gz

Redirects to the vocabulary file on HuggingFace.

## Model Resources

Models and vocabulary files are hosted on HuggingFace:
- Model: https://huggingface.co/AB498/sam3/tree/main
- Weights: https://huggingface.co/AB498/sam3/resolve/main/sam3.pt
- Vocabulary: https://huggingface.co/AB498/sam3/resolve/main/bpe_simple_vocab_16e6.txt.gz

## Deployment

This application is configured for deployment on Vercel. Simply connect your GitHub repository to Vercel for automatic deployments.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Segment Anything Model (SAM)](https://segment-anything.com/) by Meta AI
- [Grounding DINO](https://github.com/IDEA-Research/GroundingDINO) by IDEA Research
- [HuggingFace Spaces](https://huggingface.co/spaces) for hosting the inference APIs