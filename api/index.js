const app = require("express")();
app.get('/download', (req, res, next) => {
  res.redirect('https://huggingface.co/AB498/sam3/resolve/main/sam3.pt');
})
module.exports = app;