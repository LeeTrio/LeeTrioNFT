const express = require("express");
const router = express.Router();

const User = require("../models/user");

router.post(`/login`, async (req, res, next) => {
  const { address, owner } = req.body;
  console.log(address);
  console.log(owner);

  if (address === owner) {
    console.log("운영자");
    res.json({ nick: "운영자" });
  } else {
    const users = await User.findOne({
      where: { address: address },
      attributes: ["nick", "email"],
    });

    if (!users) {
      const login = { nick: "noname", email: "no-email" };
      res.json(login);
    } else {
      const login = {
        nick: users.nick,
        email: users.email,
      };
      res.json(login);
    }
  }
});

module.exports = router;
