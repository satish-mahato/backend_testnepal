const { Router } = require("express");
const v1Routes = require("./v1/v1Routes.js");

const router = Router();
router.use("/v1", v1Routes);

module.exports = router;