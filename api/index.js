const app = require("express")();
const PORT = 3000;

app.get('/test', (req, res, next) => {
  res.send('Hello World!');
})
app.get('/', (req, res, next) => {
  res.redirect('https://ab498.github.io/segment-anything-model/sam3.pt');
})

module.exports = app;