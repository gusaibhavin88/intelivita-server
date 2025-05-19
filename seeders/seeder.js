"use strict";
const users = require("../json/users.json");
const activities = require("../json/activities.json");

console.log(users, "dsfwfwf");
const { User, Activity } = require("../models");

const createUsers = async () => {
  const userData = users.map((user) => ({
    ...user,
  }));
  await User.bulkCreate(userData);
};

const createActivity = async () => {
  const activityData = activities.map((user) => ({
    ...user,
  }));
  await Activity.bulkCreate(activityData);
};
createUsers();
createActivity();
