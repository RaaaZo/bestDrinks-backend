const express = require("express");

const {
  getAllDrinks,
  getUserDrinks,
  getDrinkById,
  postCreateDrink,
  patchEditDrink,
  deleteDrink,
} = require("../controllers/recipes-controller");

const router = express.Router();

router.get("/allDrinks", getAllDrinks);

router.post("/addDrink", postCreateDrink);

router.get("/drinks/:userId", getUserDrinks);

router.patch("/editDrink/:drinkId", patchEditDrink);

router.delete("/deleteDrink/:drinkId", deleteDrink);

router.get("/singleDrink/:drinkId", getDrinkById);

module.exports = router;
