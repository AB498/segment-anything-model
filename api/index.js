const app = require("express")();
app.get('/sam3.pt', (req, res, next) => {
  res.redirect('https://huggingface.co/AB498/sam3/resolve/main/sam3.pt');
});
app.get('/vocab.txt.gz', (req, res, next) => {
  res.redirect('https://huggingface.co/AB498/sam3/resolve/main/bpe_simple_vocab_16e6.txt.gz');
});
app.get('/example', (req, res, next) => {
  res.send(`from sam3.model_builder import build_sam3_image_model
from sam3.model.sam3_image_processor import Sam3Processor
from PIL import Image
import matplotlib.pyplot as plt
import torch
import numpy as np

sam_checkpoint = "/content/sam3.pt"
bpe_path = "/content/vocab.txt.gz"

sam_model = build_sam3_image_model(
    checkpoint_path=sam_checkpoint,
    device="cuda",
    bpe_path=bpe_path
)
sam_processor = Sam3Processor(sam_model, confidence_threshold=0.3, device="cuda")`)
});
module.exports = app;