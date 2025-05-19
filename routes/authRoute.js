const loaderBoardRoute = require("express").Router();
const activityController = require("../controllers/activityController");
const validatorFunc = require("../utils/validatorFunction.helper");
const { validateUserRegistration } = require("../validators/user.validator");
const { checkProfileSize, upload } = require("../helpers/multer");

loaderBoardRoute.get("/leaderboard", activityController.listLeaderBoard);

module.exports = loaderBoardRoute;
