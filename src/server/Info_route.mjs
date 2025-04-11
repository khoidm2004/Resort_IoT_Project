import express from "express";

const info_router = express.Router();

info_router.get('/', (req, res) => {
    res.send(`Welcome`);
});

export default info_router;
