const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const JWT_SEC = process.env.JWT_SEC;

// ROUTE 1 : Creating User using : POST '/api/auth/createuser'
router.post(
  "/createuser",
  [
    body("name", "Enter valid name.").isLength({ min: 5 }),
    body("email", "Enter valid email.").isEmail(),
    body("password", "Enter valid password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    let success = false;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    try {
      let user = await User.findOne({ email: req.body.email });

      if (user) {
        return res
          .status(400)
          .json({ success, error: "sorry user already exists." });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      });

      const authtoken = jwt.sign({ _id: user._id }, JWT_SEC);

      success = true;

      res.json({ success, authtoken: authtoken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("some error occured.");
    }
  }
);

//ROUTE 2 : Creating Login Endpoint - '/api/auth/login'
router.post(
  "/login",
  [
    body("email", "Enter valid email.").isEmail(),
    body("password", "Enter valid password").exists(),
  ],
  async (req, res) => {
    let success = false;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        success = false;
        return res
          .status(400)
          .json({ success, error: "Enter valid credentials." });
      }

      const comparePassword = await bcrypt.compare(password, user.password);

      if (!comparePassword) {
        success = false;
        return res
          .status(400)
          .json({ success, error: "Enter valid credentials." });
      }

      const authtoken = jwt.sign({ _id: user._id }, JWT_SEC);
      success = true;
      res.json({ success, authtoken: authtoken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("some error occured.");
    }
  }
);

module.exports = router;
