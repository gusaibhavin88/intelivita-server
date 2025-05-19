const catchAsyncError = require("../helpers/catchAsyncError");
const { returnMessage } = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const ActivityService = require("../services/activityService");
const { sendResponse } = require("../utils/sendResponse");
const activityService = new ActivityService();

// List LeaderBoard updated
exports.listLeaderBoard = catchAsyncError(async (req, res, next) => {
  const user = await activityService.listLeaderBoard(req?.query);
  sendResponse(
    res,
    true,
    returnMessage("activity", "leaderBoardFetched"),
    user,
    statusCode.success
  );
});
