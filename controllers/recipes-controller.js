const HttpError = require("../models/http-error");
const mongoose = require("mongoose");

const Drink = require("../models/drink");
const User = require("../models/user");

const getAllDrinks = async (req, res, next) => {
  let allDrinks;

  try {
    allDrinks = await Drink.find();
  } catch (err) {
    return next(new HttpError("Coś poszło nie tak, spróbuj później.", 404));
  }

  if (!allDrinks) {
    return next(new HttpError("Nie znaleziono żadnych przepisów.", 404));
  }

  res.json({
    allDrinks: allDrinks.map((item) => item.toObject({ getters: true })),
  });
};

const getUserDrinks = async (req, res, next) => {
  const userId = req.params.userId;

  let userDrinks;

  try {
    userDrinks = await Drink.find({ creator: userId });
  } catch (err) {
    const error = new HttpError(
      "Coś poszło nie tak, spróbuj jeszcze raz później.",
      500
    );

    return next(error);
  }

  if (userDrinks.length === 0) {
    const error = new HttpError(
      "Nie znaleziono żadnych przepisów tego użytkownika.",
      404
    );

    return next(error);
  }

  res.json({
    userDrinks: userDrinks.map((user) => user.toObject({ getters: true })),
  });
};

const getDrinkById = async (req, res, next) => {
  const drinkId = req.params.drinkId;

  let drink;

  try {
    drink = await Drink.findById(drinkId);
  } catch (err) {
    const error = new HttpError(
      "Coś poszło nie tak, nie można znaleźć takiego przepisu.",
      404
    );

    return next(error);
  }

  if (!drink) {
    const error = new HttpError("Nie znaleziono takiego przepisu.", 404);

    return next(error);
  }

  res.json({ drink: drink.toObject({ getters: true }) });
};

const postCreateDrink = async (req, res, next) => {
  const {
    name,
    description,
    img,
    recipe,
    creator,
    creatorName,
    date,
  } = req.body;

  const createdDrink = new Drink({
    name,
    description,
    recipe,
    img,
    creator,
    creatorName,
    date,
  });

  let user;

  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError(
      "Stworzenie nowego przepisu nie powiodło się, spróbuj ponownie.",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Nie znaleziono użytkownika o danym id.", 404);
    return next(error);
  }

  try {
    const session = await mongoose.startSession();

    session.startTransaction();
    await createdDrink.save({ session: session });
    user.drinks.push(createdDrink);

    await user.save({ session: session });
    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Stworzenie nowego przepisu nie powiodło się, spróbuj ponownie.",
      500
    );
    return next(error);
  }

  res.status(201).json({ drink: createdDrink });
};

const patchEditDrink = async (req, res, next) => {
  const { name, description, recipe, img } = req.body;
  const drinkId = req.params.drinkId;

  let drink;

  try {
    drink = await Drink.findById(drinkId);
  } catch (err) {
    const error = new HttpError(
      "Coś poszło nie tak, nie można znaleźć takiego przepisu.",
      404
    );

    return next(error);
  }

  drink.name = name;
  drink.description = description;
  drink.img = img;
  drink.recipe = recipe;

  try {
    await drink.save();
  } catch (err) {
    const error = new HttpError(
      "Coś poszło nie tak, nie można zaktualizować przepisu.",
      500
    );

    return next(error);
  }

  res.status(200).json({ drink: drink.toObject({ getters: true }) });
};

const deleteDrink = async (req, res, next) => {
  const drinkId = req.params.drinkId;

  let drink;

  try {
    drink = await Drink.findById(drinkId).populate("creator");
  } catch (err) {
    const error = new HttpError(
      "Coś poszło nie tak, nie można usunąć przepisu.",
      500
    );

    return next(error);
  }

  if (!drink) {
    const error = new HttpError(
      "Nie można znaleźć przepisu dla podanego id.",
      404
    );

    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await drink.remove({ session: sess });
    drink.creator.drinks.pull(drink);
    await drink.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Coś poszło nie tak, nie można usunąć przepisu.",
      500
    );

    return next(error);
  }

  res.json({ message: "Usunięto" });
};

exports.getAllDrinks = getAllDrinks;
exports.getDrinkById = getDrinkById;
exports.getUserDrinks = getUserDrinks;
exports.postCreateDrink = postCreateDrink;
exports.patchEditDrink = patchEditDrink;
exports.deleteDrink = deleteDrink;
