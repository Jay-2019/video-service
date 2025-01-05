require('dotenv').config();
const express = require('express');
const { sequelize } = require('./src/models');
const bodyParser = require('body-parser');
const cors = require('cors');
require('./src/database/database');
require('./src/redis/connection');

const videoRoutes = require('./src/routes/video.routes');
const errorHandler = require('./src/utils/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/ping', (req, res) => {
    res.json({ message: 'pong' });
});
app.use('/api/videos', videoRoutes);

app.use(errorHandler);

sequelize.sync({ force: true })
  .then(() => {
    console.log('Database synchronized');

    app.listen(PORT, () => {
      console.log(`Server is running on http://127.0.0.1:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to synchronize the database:', err);
  });