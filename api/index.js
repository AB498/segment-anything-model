const app = require("express")();
app.get('/download', (req, res, next) => {
  res.redirect('https://huggingface.co/AB498/sam3/resolve/main/sam3.pt');
});
app.get('/vocab', (req, res, next) => {
  res.redirect('https://huggingface.co/AB498/sam3/resolve/main/bpe_simple_vocab_16e6.txt');
});
module.exports = app;