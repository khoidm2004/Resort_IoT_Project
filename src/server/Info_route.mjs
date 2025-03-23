import express from 'express';

const info_router  = express.Router();

info_router.get('/', (req, res) => {
    res.send(`Welcome ${uid},Khoi Do gay`);
});

export default info_router;