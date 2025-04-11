import express from 'express';

const sse_router  = express.Router();

sse_router.get('/', (req, res) => {
    res.send(`Welcome`);
});

export default sse_router;
