const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();

app.use(express.static("static"));

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "/index.html"));
});

app.get("/query/:q/:x", (req, res) => {
	let xres = [];

	let max;

	let command = req.params.q;
	let cvalue = req.params.x;

	let data = JSON.parse(
		fs.readFileSync(path.join(__dirname, "/data/data.json")),
	);
	let data2 = JSON.parse(
		fs.readFileSync(path.join(__dirname, "/data/commands.json")),
	);
	let data3 = JSON.parse(
		fs.readFileSync(path.join(__dirname, "/data/information.json")),
	);

	data3.forEach((e) => {
		if (e.code == "daypicmax") {
			max = e.content;
		}
	});

	let resStatus = false;
	data2.forEach((e) => {
		if (e.command == command && e.cvalue == cvalue && !resStatus) {
			xres = e.content;
			resStatus = true;
		}
	});

	if (!resStatus) {
		// chceck eggs
		if (command == "daypic" && cvalue != "NaV" && cvalue != "max") {
			if (cvalue > 99 || cvalue < max) {
				xres = [["HTTP 404", "title"]];
			} else {
				let day = data.days[(cvalue - 99) * -1];
				let type = day.type || "normal";

				xres.push(["HTTP respond:", "title"]);
				xres.push(["", "break"]);
				xres.push(["Dzień " + day.day, "etxt"]);
				xres.push(["", "break"]);
				xres.push([day.content, "etxt"]);
				if (type != "story") {
					xres.push(["Typ: " + type, "desc"]);
				}

				if (day.story != undefined) {
					let story = fs.readFileSync(
						path.join(__dirname, "/data/stories/" + day.story.id + ".txt"),
						"utf8",
					);

					xres.push(["", "break"]);
					xres.push([day.story.title, "title"]);
					xres.push(["", "break"]);

					story = story.split("\n");
					story.forEach((e) => {
						xres.push([e, "story"]);
					});
				}
			}
		} else if (command == "daypic" && cvalue == "max") {
			xres = [
				["HTTP respond:", "title"],
				["", "break"],
				["Aktualnie najnowszy dodany dzień to: " + max, "etxt"],
			];
		} else if (command == "eggs" && cvalue == "NaV") {
			let oninput;
			let onsubpages;
			let onpage;
			data3.forEach((e) => {
				if (e.code == "eggs") {
					oninput = e.content.oninput;
					onsubpages = e.content.onsubpages;
					onpage = e.content.onpage;
				}
			});
			xres = [
				["HTTP respond:", "title"],
				["", "break"],
				["Ilość zagadek w wyszukiwarce: " + oninput, "etxt"],
				["Ilość zagadek między stronami (w tekscie): " + onsubpages, "etxt"],
				["Ilość zagadek na stronie (każdej): " + onpage, "etxt"],
			];
		} else if (command == "finalask" && cvalue == "NaV") {
			xres.push(["HTTP respond:", "title"]);
			xres.push(["", "break"]);

			a1 = data.final.a1;
			a2 = data.final.a2;

			if (a1 == null) a1 = "HTTP 401";
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
			xres = [["HTTP 404", "title"]];
		}
	}

	res.json(xres);
});

app.listen(process.env.PORT || 3000, () => {
	console.log(`I'm saying right now`);
});
