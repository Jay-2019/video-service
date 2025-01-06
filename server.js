require('dotenv').config();
const express = require('express');
const { sequelize } = require('./src/models');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
require('./src/database/database');
require('./src/redis/connection');

const videoRoutes = require('./src/routes/video.routes');
const handleError = require('./src/utils/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', (req, res, next) => {
    if (req.path === '/ping') {
        return res.json({ message: 'pong' });
    }
    next();
});

app.use('/api/videos', videoRoutes);

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Error handling middleware
app.use((err, req, res, next) => {
    if (!res.headersSent) {
        handleError(res, err);
    }
});

sequelize.sync({ force: true })
    .then(() => {
        console.log('Database synchronized');
        app.listen(PORT, () => {
            console.log(`Server is running on http://127.0.0.1:${PORT}`);
            console.log(`Swagger docs available at http://127.0.0.1:${PORT}/api-docs`);
        });
    })
    .catch(err => {
        console.error('Unable to synchronize the database:', err);
    });