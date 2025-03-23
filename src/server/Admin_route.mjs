import express from 'express';

const admin_router = express.Router();

admin_router.get('/', (req, res) => {
    res.send(`Welcome Khoi Do gay`);
});

export default admin_router;