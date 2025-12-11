const app = require("express")();
const PORT = 3000;

app.get('/', (req, res, next) => {
  res.redirect('https://ab498.github.io/segment-anything-model/sam3.pt');
})

app.listen(PORT);

module.exports = app;