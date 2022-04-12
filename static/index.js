const input = document.querySelector(".input-text");
const xconsole = document.querySelector(".console");
const content = document.querySelector(".content");

const host = window.location.href;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const makeProcess = async () => {
	let result;
	let v = input.value;

	v = v.toLowerCase();
	v = v.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

	x = v.split(" ");
	let command = x[0];
	let cvalue = x[1] || "NaV";

	await fetch(host + "query/" + command + "/" + cvalue)
		.then(function (res) {
			return res.json();
		})
		.then(function (data) {
			result = JSON.parse(JSON.stringify(data));
		});

	if (xconsole.style.paddingTop == "7.5vh") {
		content.style.opacity = "0";
		await delay(1200);
	} else {
		xconsole.style.paddingTop = "7.5vh";
		await delay(1200);
	}

	input.value = "";
	content.innerHTML = "";

	if (command == "exit") {
		xconsole.style.paddingTop = "25vh";
		content.style.opacity = "0";
	} else {
		let xresult = document.createElement("div");
		xresult.classList.add("result");

		result.forEach((e) => {
			if (e[1] == "link") {
				let x = document.createElement("a");
				x.href = e[0];
				x.innerText = e[2];
				x.classList.add(e[1]);
				xresult.appendChild(x);
			} else if (e[1] == "break") {
				let x = document.createElement("br");
				x.classList.add(e[1]);
				xresult.appendChild(x);
			} else {
				let x = document.createElement("p");
				x.innerHTML = e[0];
				x.classList.add(e[1]);
				xresult.appendChild(x);
			}
		});

		content.appendChild(xresult);
		content.style.opacity = "1";
	}
};

input.addEventListener("keyup", function (event) {
	event.preventDefault();
	if (event.keyCode === 13) {
		makeProcess();
	}
});
