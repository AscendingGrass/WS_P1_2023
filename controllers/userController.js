const { Op, Sequelize, NOW } = require("sequelize");
const Joi = require("joi").extend(require("@joi/date"));
const axios = require("axios");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs"); //filesystem
const path = require("path");
const connection = require("../databases/db_words");
const secret = process.env.SECRET_KEY;
const {
  User,
  Explanation_Like,
  Subscription,
  Transaction,
  User_Explanation,
  Word,
} = require("../models");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const folderName = `uploads/`;

    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName, { recursive: true });
    }

    callback(null, folderName);
  },
  filename: (req, file, callback) => {
    console.log(file);
    const fileExtension = path.extname(file.originalname).toLowerCase();

    // callback(null, "tes.jpg");

    // memberi nama file sesuai dengan nama file asli yang diupload
    // callback(null, file.originalname);
    if (file.fieldname == "pengguna_pp") {
      callback(null, `${req.id}.jpg`);
    } else if (file.fieldname == "pengguna_file[]") {
      callback(null, `${id}${fileExtension}`);
      id++;
    } else {
      callback(null, false);
    }
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50000000, // dalam byte jadi 1000 = 1kb 1000000 = 1mb
  },
  fileFilter: (req, file, callback) => {
    // buat aturan dalam bentuk regex, mengenai extension apa saja yang diperbolehkan
    const rules = /jpeg|jpg|png/;

    const fileExtension = path.extname(file.originalname).toLowerCase();
    const fileMimeType = file.mimetype;

    const cekExt = rules.test(fileExtension);
    const cekMime = rules.test(fileMimeType);

    if (cekExt && cekMime) {
      callback(null, true);
    } else {
      callback(null, false);
      return callback(
        new multer.MulterError(
          "Tipe file harus .png, .jpg atau .jpeg",
          file.fieldname
        )
      );
    }
  },
});
// GET '/users?'
const getUsers = async (req, res) => {
  const user = req.body.user;
  if(Number(user.role) !== 1){
    return res.status(403).json({message: "Forbidden access"});
  }
  const {name} = req.query;
  const query = `%${name}%`
  const users = await User.findAll({
    where: {
      name: {[Op.like]: query},
      active: 1
    }
  });
  return res.status(200).json({users});
};

// GET '/users/:id'
const getUser = async (req, res) => {
  const user = await req.body.user;
  if(!Number(user.active)){
    return res.status(400).json({message: "User is not active"});
  }
  return res.status(200).json({user});
};

// POST '/users'
const addUser = async (req, res) => {
  let { name, password, email } = req.body;
  const schema = Joi.object({
    name: Joi.string().required().messages({
      "string.empty": "Invalid data field",
    }),
    password: Joi.string().min(8).required().messages({
      "string.empty": "Invalid data field",
    }),
    confirm_password: Joi.string()
      .required()
      .valid(Joi.ref("password"))
      .messages({
        "string.empty": "Invalid data field",
        "any.only": "Password do not match",
      }),
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email address",
      "string.empty": "Invalid data field",
    }),
  });

  try {
    await schema.validateAsync(req.body);
  } catch (error) {
    return res.status(403).send(error.toString());
  }

  let checkEmail = await User.findAll({
    where: {
      email: {
        [Op.eq]: email,
      },
    },
  });

  if (checkEmail.length !== 0) {
    return res.status(400).json({ message: "Email already in use" });
  }

  var api = await crypto.randomUUID();
  let hashedPassword;
  await bcrypt.hash(password, 10).then((hash) => {
    hashedPassword = hash;
  });

  

  const addUser = await User.create({
    name: name,
    password: hashedPassword,
    email: email,
    api_key: api,
    profile_path: null,
    role: 0,
    active: 1,
    createdAt: null,
    updatedAt: null,
  });

  return res.status(200).json({
    name: name,
    email: email,
    api_key: api,
  });
};

// POST '/users/login'
const loginUser = async (req, res) => {
  const schema = Joi.object({
    password: Joi.string().required().messages({
      "string.empty": "Invalid data field",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email address",
      "string.empty": "Invalid data field",
    }),
  });

  try {
    await schema.validateAsync(req.body);
  } catch (error) {
    return res.status(403).send(error.toString());
  }

  let { email, password } = req.body;
  const findUser = await User.findAll({
    where: {
      email: email,
    },
  });
  if (findUser == 0) {
    return res
      .status(400)
      .json({ message: "The user has not been registered" });
  }

  const checkPassword = await bcrypt.compare(password, findUser[0].password);

  if (!checkPassword) {
    return res.status(400).json({ message: "Incorrect Password" });
  }

  const checkSubs = await Transaction.findAll({
    where: {
      user_id: findUser[0].id,
    },
  });
  var subs_status;
  if (!checkSubs[0]) {
    subs_status = null;
  } else {
    subs_status = checkSubs[0].status;
  }

  let token = jwt.sign(
    {
      id: findUser[0].id,
      role: findUser[0].role,
      subs_status: subs_status,
      api_key: findUser[0].api_key,
    },
    secret,
    { expiresIn: "3600s" }
  );
  return res.status(200).json({
    email: email,
    token: token,
    message: "You have successfully logged in to your account.",
  });
};

// DELETE '/users'
const deleteUser = async (req, res) => {
  const user = req.body.user;
  user.update({
    active: 0
  });
  return res.status(200).json({message: `User with username ${user.username} was successfully deleted`});
};

// PUT '/users/profile'
const updateUserProfilePicture = async (req, res) => {
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
  } else {
    req.id = data.id;
    const uploadingFile = upload.single("pengguna_pp");
    uploadingFile(req, res, async (err) => {
      if (err) {
        console.log(err);
        return res
          .status(400)
          .send((err.message || err.code) + " pada field " + err.field);
      }
      const body = req.body;
      await User.update({
        profile_path: "uploads/"+req.id
      }, {
        where: {
          id: data.id
        }
      })
      return res.status(200).json({"message":"sukses"});
    });
  }
};

// PUT '/users/password'
const updateUserPassword = async (req, res) => {
  const { password, new_password } = req.body
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
  const schema = Joi.object({
    password: Joi.string().min(8).required().messages({
      "string.empty": "Invalid data field",
    }),
    new_password: Joi.string().min(8).required().messages({
      "string.empty": "Invalid data field",
    }),
  })
  try {
    await schema.validateAsync(req.body);
  } catch (error) {
    return res.status(403).send(error.toString());
  }
  const checkPassword = await bcrypt.compare(password, user[0].password);

  if (!checkPassword) {
    return res.status(400).json({ message: "Incorrect Password" });
  }
  let hashedPassword;
  await bcrypt.hash(new_password, 10).then((hash) => {
    hashedPassword = hash;
  });
  await User.update({
    password: hashedPassword
  }, {
    where: {
      id: data.id
    }
  })
  return res.status(200).json({ message: "Berhasil ubah password" })
};

// POST '/users/:id/key'
const regenerateApiKey = async (req, res) => {
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
  var api = await crypto.randomUUID();
  await User.update({
    api_key: api
  }, {
    where: {
      id: data.id
    }
  })
  return res.status(200).json({
    new_api_key: api
  })
};
module.exports = {
  getUsers,
  getUser,
  addUser,
  loginUser,
  deleteUser,
  updateUserProfilePicture,
  updateUserPassword,
  regenerateApiKey,
};
