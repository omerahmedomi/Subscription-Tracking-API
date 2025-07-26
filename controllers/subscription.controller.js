import { SERVER_URL } from "../config/env.js";
import Subscription from "../models/subscription.model.js";
import { workflowClient } from "./../config/upstash.js";


export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
    });

    const { workflowRunId } = await workflowClient.trigger({
      url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
      body: {
        subscriptionId: subscription._id,
      },
      headers: {
        "content-type": "application/json",
      },
      retries: 0,
    });

    res
      .status(201)
      .json({ success: true, data: { subscription, workflowRunId } });
  } catch (e) {
    next(e);
  }
};

export const getUserSubscriptions = async (req, res, next) => {
  try {
    if (req.user._id != req.params.id) {
      const error = new Error("you are not the owner of this account");
      error.statusCode = 401;

      throw error;
    }
    const userSubscriptions = await Subscription.find({ user: req.params.id });
    res.status(200).json({ success: true, data: userSubscriptions });
  } catch (error) {
    next(error);
  }
};

export const getAllSubscriptions = async (req, res, next) => {
  try {
    console.log("From getAllSubscriptions");
    const allSubscriptions = await Subscription.find();

    res.status(200).json({ success: true, data: allSubscriptions });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionDetails = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};
