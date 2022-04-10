const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();

app.use(express.static("static"));

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "/index.html"));
});

const help = [
	["HTTP respond:", "title"],
	["", "break"],
	["> 'command' help - pokazuje stronę pomocy", "txt"],
	["> commands list - pokazuje listę komend", "txt"],
	["> version - pokazuje aktualną wersje programu", "txt"],
	["> exit", "etxt"],
];
const hversion = [
	["Program version: 1.1.0", "title"],
	["", "break"],
];
const e404 = [
	["HTTP 404", "title"],
	["", "break"],
];
const clist = [
	["HTTP respond:", "title"],
	["", "break"],
	["> daypic", "etxt"],
	["> finalask", "etxt"],
	["> declassified", "etxt"],
];
const hdaypic = [
	["HTTP respond:", "title"],
	["", "break"],
	["daypic x - Pokazuje x dzień z bazy danych"],
];
const hfinalask = [
	["HTTP respond:", "title"],
	["", "break"],
	["finalask - Pokazuje finałowe pytanie i umożliwia n... XHTPP 404"],
];
const hdeclassified = [
	["HTTP respond:", "title"],
	["", "break"],
	["declassified - Pokazuje odtajnione archiwa"],
];

app.get("/query/:q/:x", (req, res) => {
	let xres = [];

	let command = req.params.q;
	let cvalue = req.params.x;

	let data = JSON.parse(fs.readFileSync(path.join(__dirname, "/data.json")));

	if (command == "help" && cvalue == "NaV") {
		xres = help;
	} else if (command == "version" && cvalue == "NaV") {
		xres = hversion;
	} else if (command == "commands" && cvalue == "list") {
		xres = clist;
	} else if (command == "daypic" && cvalue == "help") {
		xres = hdaypic;
	} else if (command == "finalask" && cvalue == "help") {
		xres = hfinalask;
	} else if (command == "declassified" && cvalue == "help") {
		xres = hdeclassified;
	} else if (command == "daypic" && cvalue != "NaV") {
		let max = data.max;
		if (cvalue > 99 || cvalue < max) {
			xres = e404;
		} else {
			let day = data.days[(cvalue - 99) * -1];

			xres.push(["HTTP respond:", "title"]);
			xres.push(["", "break"]);
			xres.push(["Dzień " + day.day, "etxt"]);
			xres.push(["", "break"]);
			xres.push([day.content, "etxt"]);
			xres.push(["Typ: " + day.type, "desc"]);

			if (day.story.id != null) {
				xres.push(["Historia id:" + day.story.id, "link", day.story.id]);
			}
		}
	} else if (command == "finalask" && cvalue == "NaV") {
		xres.push(["HTTP respond:", "title"]);
		xres.push(["", "break"]);

		a1 = data.final.a1;
		a2 = data.final.a2;

		if (a1 == null) a1 = "HTTP 404";
		if (a2 == null) a2 = "HTTP 404";

		xres.push(["Pytanie: " + a1, "txt"]);
		xres.push(["Odpowiedz: " + a2, "txt"]);
	} else if (command == "declassified" && cvalue == "NaV") {
		xres.push(["HTTP respond:", "title"]);
		xres.push(["", "break"]);

		let s = data.unsecured;
		x = s.split("\n");

		x.forEach((e) => {
			xres.push([e, "txt"]);
		});
	} else {
		xres = e404;
	}

	res.json(xres);
});

app.listen(process.env.PORT || 3000, () => {
	console.log(`I'm saying right now`);
});
