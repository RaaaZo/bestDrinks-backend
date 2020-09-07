const HttpError = require("../models/http-error");

const User = require("../models/user");

const getUser = async (req, res, next) => {
  const { userId } = req.params;

  let user;

  try {
    user = await User.findById(userId, "-password");
  } catch (err) {
    const error = new HttpError(
      "Pobranie użytkowników nie powiodło się, spróbuj ponownie później.",
      500
    );

    return next(error);
  }

  res.json({ user: user.toObject({ getters: true }) });
};

const signup = async (req, res, next) => {
  const { name, email, password } = req.body;

  const lowerCaseEmail = email.toLowerCase();

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Rejestracja nie powiodła się, spróbuj ponownie później.",
      500
    );

    return next(error);
  }

  if (existingUser) {
    const error = new HttpError("E-mail jest już zajęty.", 422);

    return next(error);
  }

  const createdUser = new User({
    name,
    email: lowerCaseEmail,
    password,
    drinks: [],
    favourites: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Rejestracja nie powiodła się.", 500);

    return next(error);
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  const lowerCaseEmail = email.toLowerCase();

  let existingUser;

  try {
    existingUser = await User.findOne({ email: lowerCaseEmail });
  } catch (err) {
    const error = new HttpError(
      "Logowanie nie powiodło się, spróbuj ponownie później.",
      500
    );

    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError("Podane dane logowania są błędne.", 404);

    return next(error);
  }

  res.json({
    message: "Zalogowano",
    user: existingUser.toObject({ getters: true }),
  });
};

exports.getUser = getUser;
exports.signup = signup;
exports.login = login;
