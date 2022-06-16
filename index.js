const express = require("express");

const app = express();
const path = require("path");

app.use(express.static("static"));

// Hosting application
app.listen(process.env.PORT || 3000, () => {
	console.log(`Hosting on port: ${process.env.PORT || 3000}`);
});
