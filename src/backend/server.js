const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3003;
app.use(bodyParser.json());
app.use(cors());
app.get('/api/products', (req, res) => {
  fs.readFile('products.json', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: 'Error reading file' });
    } else {
      res.send(JSON.parse(data));
    }
  });
});

app.get('/api/item', (req, res) => {
  fs.readFile('item.json', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: 'Error reading file' });
    } else {
      res.send(JSON.parse(data));
    }
  });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
