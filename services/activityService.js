const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");

const { User, Activity } = require("../models");
const { Op } = require("sequelize");

class ActivityService {
  listLeaderBoard = async (payload) => {
    try {
      // Parse scroll params (limit & offset)
      const limit = parseInt(payload.limit) || 10;
      const offset = parseInt(payload.offset) || 0;
      const filter = payload.filter || null;
      // Build where clause for date filtering
      const where = {};
      const now = new Date();

      if (filter === "Day") {
        // Activities for today
        const startOfDay = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        const endOfDay = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1
        );
        where.performed_at = {
          [Op.gte]: startOfDay,
          [Op.lt]: endOfDay,
        };
      } else if (filter === "Month") {
        // Activities for this month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfNextMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          1
        );
        where.performed_at = {
          [Op.gte]: startOfMonth,
          [Op.lt]: startOfNextMonth,
        };
      } else if (filter === "Year") {
        // Activities for this year
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const startOfNextYear = new Date(now.getFullYear() + 1, 0, 1);
        where.performed_at = {
          [Op.gte]: startOfYear,
          [Op.lt]: startOfNextYear,
        };
      }

      if (payload?.search) {
        where.user_id = { [Op.eq]: payload.search };
      }

      // Fetch filtered activities
      const activities = await Activity.findAll({
        attributes: ["user_id", "points", "performed_at"],
        where,
        raw: true,
        include: [
          {
            model: User,
            attributes: ["full_name"],
          },
        ],
      });
      const userPointsMap = {};
      const userNamesMap = {};

      for (const activity of activities) {
        const uid = activity.user_id;
        const pts = Number(activity.points);
        userPointsMap[uid] = (userPointsMap[uid] || 0) + pts;
        if (activity["User.full_name"]) {
          userNamesMap[uid] = activity["User.full_name"];
        }
      }

      // Convert map to array for sorting
      let leaderboard = Object.entries(userPointsMap).map(
        ([user_id, totalPoints, performed_at]) => ({
          user_id: Number(user_id),
          totalPoints,
          performed_at,
          full_name: userNamesMap[user_id] || null,
        })
      );

      // Sort descending by totalPoints
      leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);

      // Assign ranks with ties
      let currentRank = 0;
      let previousPoints = null;
      let skippedRanks = 0;
      leaderboard = leaderboard.map((entry, index) => {
        if (entry.totalPoints !== previousPoints) {
          currentRank = index + 1 + skippedRanks;
          skippedRanks = 0;
        } else {
          skippedRanks++;
        }
        previousPoints = entry.totalPoints;
        return { ...entry, rank: currentRank };
      });

      // Scroll load: slice by offset and limit
      const pagedLeaderboard = leaderboard.slice(offset, offset + limit);

      return {
        data: pagedLeaderboard,
        totalCount: leaderboard.length,
        offset,
        limit,
      };
    } catch (error) {
      logger.error(`Error while list leader board: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };
}

module.exports = ActivityService;
