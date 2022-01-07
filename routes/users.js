const express = require('express');
const router = express.Router();
const controller = require("../controllers/users");

router.get("/",controller.getHomePage);
router.post("/",controller.postHomePage);

router.get("/login",controller.getLogin);
router.post("/login",controller.postLogin);

router.get("/register",controller.getRegister);
router.post("/register",controller.postRegister);

router.get("/contact-us",controller.getContactUs);
router.post("/contact-us",controller.postContactUs);

router.get("/verify/:token",controller.Verify);
router.get("/logout",controller.logout);

module.exports = router;