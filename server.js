require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('./src/database/database');
const videoRoutes = require('./src/routes/video.routes');
const errorHandler = require('./src/utils/errorHandler');

const app = express();
const PORT = Number(process.env.PORT);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/ping', (req, res) => {
    res.json({ message: 'pong' });
});


app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});