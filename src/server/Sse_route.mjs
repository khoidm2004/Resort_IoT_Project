import express from 'express';

const sse_router  = express.Router();

sse_router.get('/', (req, res) => {
    res.send(`Welcome,Khoi Do gay`);
});

export default sse_router;