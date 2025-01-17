const { ServerError } = require("../../errors");
const prisma = require("../../prisma");
const jwt = require("./jwt");
const bcrypt = require("bcrypt");
const router = require("express").Router();
module.exports = router;

/** Creates new account and returns token */
router.post("/register", async (req, res, next) => {
  try {
    const { username, password, email, phone, name } = req.body;

    // Check if username and password provided
    if (!username || !password || !email || !phone || !name) {
      res.json({ error: "ALL Information required" });
      throw new ServerError(400, "Username and password required.");
    }
    //check if email already exist
    const userEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (userEmail) {
      res.json({ message: `Account with email ${email} already exists` });
      throw new ServerError(400, `Account with email ${email} already exists`);
    }
    // Check if account already exists
    const user = await prisma.user.findUnique({
      where: { username },
    });
    if (user) {
      res.json({
        message: `Account with username: ${username} already exists`,
      });
      throw new ServerError(
        400,
        `Account with username ${username} already exists.`
      );
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: { username, password, email, phone },
    });

    // const token = jwt.sign({ id: newUser.id });
    res.json({ message: "Successfull" });
  } catch (err) {
    next(err);
  }
});

/** Returns token for account if credentials valid */
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    console.log(req.body);
    // Check if username and password provided
    if (!username || !password) {
      res.json({ error: "Username and password required." });
      throw new ServerError(400, "Username and password required.");
    }

    // Check if account exists
    const user = await prisma.user.findUnique({
      where: { username },
    });
    if (!user) {
      res.json({
        error: "`Account with username ${username} does not exist.`",
      });
      throw new ServerError(
        400,
        `Account with username ${username} does not exist.`
      );
    }

    // Check if password is correct
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      res.json({ error: "Invalid password." });
      throw new ServerError(401, "Invalid password.");
    }

    const token = jwt.sign({ id: user.id });
    res.json({ token });
  } catch (err) {
    next(err);
  }
});
