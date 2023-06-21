const { Op, Sequelize, NOW } = require("sequelize");
const Joi = require("joi").extend(require("@joi/date"));
const axios = require("axios");
const jwt = require("jsonwebtoken");
const connection = require("../databases/db_words");
const secret = process.env.SECRET_KEY || "";
const {
  User,
  Explanation_Like,
  Subscription,
  Transaction,
  User_Explanation,
  Word,
} = require("../models");

// POST '/subscription/pay'
const addTransaction = async (req, res) => {
  const token = req.headers["x-auth-token"] || "";
  const replace = req.body.replace === "true";

  let flag = false;
  let user = null;

  // check if JWT is valid
  if (token) {
    try {
      const data = jwt.verify(token, secret);
      user = await User.findOne({
        where: {
          id: data.id,
        },
      });

      if (user) {
        flag = true;
      }
    } catch (err) {}
  }

  if (!flag) {
    return res.status(403).json({ message: "unauthorized" });
  }

  if (!replace) {
    const latestSubscription = await Subscription.findOne({
      where: {
        user_id: user.id,
      },
      order: [["expiration_date", "DESC"]],
    });

    if (latestSubscription != null) {
      if (new Date(latestSubscription.expiration_date) > new Date()) {
        return res.status(403).json({
          message:
            "you have an active subscription, are you sure you want to replace it? set replace to 'true' in the body if so",
        });
      }
    }
  }

  const gross_amount = 10_000;
  const order_id = Transaction.generateOrderId(user);
  const midtransPromise = axios.post(
    String(process.env.MIDTRANS_SNAP_URL),
    {
      transaction_details: {
        order_id,
        gross_amount,
      },
      credit_card: {
        secure: true,
      },
    },
    {
      auth: {
        username: String(process.env.SERVER_KEY),
        password: "",
      },
    }
  );

  await Transaction.create({
    user_id: user.id,
    order_id,
    paid_amount: gross_amount,
  });

  return res.status(200).json((await midtransPromise).data);
};

// POST '/subscription/validate'
const validateSubscriptionTransaction = async (req, res) => {
  const token = req.headers["x-auth-token"] || "";

  let flag = false;
  let user = null;

  // check if JWT is valid
  if (token) {
    try {
      const data = jwt.verify(token, secret);
      user = await User.findOne({
        where: {
          id: data.id,
        },
      });

      if (user) {
        flag = true;
      }
    } catch (err) {}
  }

  if (!flag) {
    return res.status(403).json({ message: "unauthorized" });
  }

  const unverifiedTransactions = await Transaction.findAll({
    where: {
      user_id: user.id,
      status: {
        [Op.or]: [null, "pending"],
      },
    },
  });

  let expiration_date = new Date();
  expiration_date = new Date(
    expiration_date.setMonth(expiration_date.getMonth() + 1)
  );

  let updatedTransactions = [];

  await Promise.all(
    unverifiedTransactions.map(async (x) => {
      const url = process.env.MIDTRANS_V2_URL + `/${x.order_id}/status`;
      const status = (
        await axios.get(url, {
          auth: {
            username: String(process.env.SERVER_KEY),
            password: "",
          },
        })
      ).data;

      if (status.status_code == "404") {
        return;
      }

      const originalStatus = x.status;
      const updatePromise = x.update({
        status: status.transaction_status,
      });

      if (originalStatus != x.status || originalStatus != "pending")
        updatedTransactions.push(x);
      if (
        status.transaction_status === "capture" ||
        status.transaction_status === "settlement"
      ) {
        await Subscription.create({
          user_id: user.id,
          transaction_id: x.id,
          expiration_date,
        });
      }

      await updatePromise;
    })
  );

  const accepted = unverifiedTransactions.filter(
    (x) => x.status === "capture" || x.status === "settlement"
  );
  updatedTransactions = updatedTransactions.map((x) => {
    return {
      dateTime: x.createdAt,
      status: x.status,
    };
  });

  if (accepted.length == 0) {
    return res.status(200).json({
      message: "No verified payments found",
      updatedTransactions,
    });
  }

  if (accepted.length == 1) {
    return res.status(200).json({
      message: "Payment verified, subscription is now active",
      expiration_date,
      updatedTransactions,
    });
  }

  return res.status(200).json({
    message:
      "multiple payments verified, subscription is now active, are you sure this is not a mistake?",
    expiration_date,
    updatedTransactions,
  });
};

// GET '/transactions?'
const getTransactions = async (req, res) => {
  const user = req.body.user;
  if(!Number(user.role)){
    return res.status(403).json({message: "Forbidden access"});
  }
  const {awal, akhir} = req.query;
  let results = undefined;
  if(awal && akhir){
    const awalDate = new Date(awal);
    const akhirDate = new Date(akhir);
    if(!awalDate || !akhirDate){
      return res.status(400).json({message: "Invalid date format"});
    }
    results = await Transaction.findAll({
      where: {
        createdAt: {[Op.gt] : awalDate},
        createdAt: {[Op.lt] : akhirDate}
      }
    });
  }else{
    results = await Transaction.findAll();
  }
  return res.status(200).json({results});
};

module.exports = {
  addTransaction,
  validateSubscriptionTransaction,
  getTransactions,
};
