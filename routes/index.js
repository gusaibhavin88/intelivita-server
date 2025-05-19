const router = require("express").Router();
const loaderBoardRoute = require("./authRoute");

router.use("/activity", loaderBoardRoute);
module.exports = router;
