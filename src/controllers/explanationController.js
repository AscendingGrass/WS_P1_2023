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

// POST '/explanations'
const addExplanation = async (req, res) => {
  const apiKey = req.headers["authorization"] || "";
  const token = req.headers["x-auth-token"] || "";

  let flag = false;
  let user = null;

  // check if apiKey or JWT is valid
  if (apiKey) {
    if (apiKey.startsWith("Bearer ")) {
      const key = apiKey.substring(7);
      user = await User.findOne({
        where: {
          api_key: key,
        },
      });

      if (user) {
        flag = true;
      }
    }
  } else if (token) {
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

  const subs_status = await Transaction.findOne({
    where: { user_id: user.id },
  });

  if (!subs_status) {
    return res.status(400).json({
      message: "You must buy a subscriptions first",
    });
  }

  if (subs_status.status !== "settlement") {
    return res.status(400).json({
      message: "You must buy a subscriptions first",
    });
  }

  let { keyword, explanation } = req.body;

  if (keyword == "" || explanation == "") {
    return res.status(400).json({ message: "Invalid data field" });
  }

  const findWord = await Word.findOne({ where: { word: keyword } });

  if (!findWord) {
    const createWord = await Word.create({
      word: keyword,
      search_count: 0,
      createdAt: null,
      updatedAt: null,
    });
  }

  const findWord2 = await Word.findOne({ where: { word: keyword } });

  const createExplanation = await User_Explanation.create({
    user_id: user.id,
    word_id: findWord2.id,
    explanation: explanation,
    likes: 0,
    dislikes: 0,
    createdAt: null,
    updatedAt: null,
  });

  return res.status(200).json({
    word: keyword,
    newExplnation: explanation,
    message: `Successfully added a new explanation to the word ${keyword}`,
  });
};

// PUT '/explanations'
const updateExplanation = async (req, res) => {
  const apiKey = req.headers["authorization"] || "";
  const token = req.headers["x-auth-token"] || "";

  let flag = false;
  let user = null;

  // check if apiKey or JWT is valid
  if (apiKey) {
    if (apiKey.startsWith("Bearer ")) {
      const key = apiKey.substring(7);
      user = await User.findOne({
        where: {
          api_key: key,
        },
      });

      if (user) {
        flag = true;
      }
    }
  } else if (token) {
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

  let { id, explanation } = req.body;

  if (id == "" || explanation == "") {
    return res.status(400).json({ message: "Invalid data field" });
  }

  const findExplanation = await User_Explanation.findOne({
    where: {
      id: id,
      user_id: user.id,
    },
  });

  if (!findExplanation) {
    return res.status(400).json({ message: "Explanation Not Found" });
  }

  const updateExplanation = await User_Explanation.update(
    {
      explanation: explanation,
    },
    { where: { id: id } }
  );

  return res.status(200).json({
    message: "Successfully update explanation!",
  });
};

// DELETE '/explanations'
const deleteExplanation = async (req, res) => {
  const apiKey = req.headers["authorization"] || "";
  const token = req.headers["x-auth-token"] || "";

  let flag = false;
  let user = null;

  // check if apiKey or JWT is valid
  if (apiKey) {
    if (apiKey.startsWith("Bearer ")) {
      const key = apiKey.substring(7);
      user = await User.findOne({
        where: {
          api_key: key,
        },
      });

      if (user) {
        flag = true;
      }
    }
  } else if (token) {
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

  let { id } = req.body;

  if (id == "") {
    return res.status(400).json({ message: "Invalid data field" });
  }

  const findExplanation = await User_Explanation.findOne({
    where: {
      id: id,
      user_id: user.id,
    },
  });

  if (!findExplanation) {
    return res.status(400).json({ message: "Explanation Not Found" });
  }

  const deleteExplanation = await User_Explanation.destroy({
    where: { id: id },
  });

  return res.status(200).json({
    message: "Successfully delete explanation!",
  });
};

// PUT '/explanations/:id/likes'
const updateExplanationLikes = async (req, res) => {
  const { id } = req.params
    const { status } = req.body
    let flag = false;
    let user;
    let data;
    const token = req.headers["x-auth-token"] || "";
    if (token) {
        try {
            data = jwt.verify(token, secret);
            user = await User.findAll({
                where: {
                    id: data.id
                }
            })

            if (user) {
                flag = true;
            }
        }
        catch (err) { }
    }
    if (!flag) {
        return res.status(403).json({ message: "unauthorized" });
    }
    if (!status) {
        return res.status(403).json({ message: "Invalid status" });
    }
    if (status == "0" || status == "1" || status == "2") {
        const cariexplanation = await User_Explanation.findAll({
            where: {
                id: id
            }
        })
        if (cariexplanation.length == 0) {
            return res.status(404).json({ message: "Explanation tidak ditemukan" })
        } else {
            const ceksudahadadidb = await Explanation_Like.findAll({
                where: {
                    user_id: user[0].id,
                    explanation_id: id,
                }
            })
            if (ceksudahadadidb.length == 0) {
                await Explanation_Like.create({
                    user_id: user[0].id,
                    explanation_id: id,
                    status: 0
                })
            }
            const ambildatadidb = await Explanation_Like.update(
                {
                    status: status
                }, {
                where: {
                    user_id: user[0].id,
                    explanation_id: id,
                }
            })
            return res.status(200).json({ message: "Berhasil merubah status" })
        }
    } else {
        return res.status(400).json({ message: "Invalid status" })
    }
};

// GET '/explanations?'
const getExplanations = async (req, res) => {};

module.exports = {
  addExplanation,
  updateExplanation,
  deleteExplanation,
  updateExplanationLikes,
  getExplanations,
};
