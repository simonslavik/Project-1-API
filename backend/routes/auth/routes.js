const express = require("express");
const {registerUser, loginUser, logoutUser, getAllUsers, getUser} = require("../../controllers/user");
const { authMiddleware } = require('../../middlewares/authMiddleware');


const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/check-auth", authMiddleware, (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    message: "Authenticated user!",
    user,
  });
});
router.get("/", authMiddleware, getAllUsers);
router.get("/:id", authMiddleware, getUser);



module.exports = router;