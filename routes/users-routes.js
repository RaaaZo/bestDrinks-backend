const express = require("express");
const { getUser, login, signup } = require("../controllers/users-controller");

const router = express.Router();

router.get("/:userId", getUser);

router.post("/signup", signup);

router.post("/login", login);

module.exports = router;
