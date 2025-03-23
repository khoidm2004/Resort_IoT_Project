import express from 'express';

const user_router  = express.Router();

user_router.get('/', (req, res) => {
    const {uid} = req.query;
    if (!uid) {
        return res.status(400).send("uid is missing");
    }
    res.send(`Welcome ${uid},Khoi Do gay`);
});

export default user_router;