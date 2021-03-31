//META{"name":"AnimatedStatus","source":"https://raw.githubusercontent.com/BizcuitMild/Discord-Status/main/Discord_Status.plugin.js","website":"https://github.com/BizcuitMild/Discord-Status"}*//

class AnimatedStatus {
	getName () {
		return "DiscordStatus";
	}

	getVersion () {
		return "0.1.0";
	}

	getAuthor () {
		return "Samild.";
	}

	getDescription () {
		return "Animate your Discord status";
	}

	setData (key, value) {
		BdApi.setData(this.getName(), key, value);
	}

	getData (key) {
		return BdApi.getData(this.getName(), key);
	}

	load () {
		this.animation = this.getData("animation");
		this.timeout = this.getData("timeout");
	}

	start () {
		if (this.animation == undefined || this.timeout == undefined || Status.authToken == undefined) return;
		this.Status_Animate();
	}

	stop () {
		clearTimeout(this.loop);
		Status.unset();
	}

	Status_Eval (string) {
		try {
			return ((string.startsWith("eval ")) ? (eval(string.substr(5))) : (string));
		}
		catch (e) {
			BdApi.showToast(e, {type: "error"});
			return "";
		}
	}

	Status_Animate (index = 0) {
		if (index >= this.animation.length) index = 0;
		if (this.animation[index] == undefined) {
			BdApi.showToast("Animated Status: No status set. Go to Settings>Plugins to set a custom animation!");
			return;
		}

		let results = this.animation[index].map(async (element) => this.Status_Eval(element));
		Promise.all(results).then(res => {
			Status.set(res)
			this.loop = setTimeout(() => { this.Status_Animate(index + 1); }, this.timeout);
		});
	}

	newRawEdit (str = "") {
		let out = GUI.newTextarea();
		out.style.fontFamily = "SourceCodePro,Consolas,Liberation Mono,Menlo,Courier,monospace";
		out.placeholder = '"Test (Message)"\n"Test (Message)", "👍 (Symbol)"\n"Test (Message)", "emoji (Nitro Symbol)", "000000000000000000 (Nitro Symbol ID)"\n"eval new String(\'test\') (Javascript)"\n"eval new String(\'test\') (Javascript)", "eval new String(\'👍\') (Javascript)"\n...';
		out.value = str;
		return out;
	}

	newRichRow (text, emoji, optNitroId = undefined) {
		let hbox = GUI.newHBox();

		let textWidget = GUI.newInput(text);
		textWidget.placeholder = "Text";
		textWidget.style.marginRight = "15px";
		if (text != undefined) textWidget.value = text;
		hbox.appendChild(textWidget);


		let emojiWidget = GUI.newInput(emoji);
		emojiWidget.placeholder = "👍 / nitro_name";
		emojiWidget.style.width = "140px";
		emojiWidget.style.marginRight = "15px";
		if (emoji != undefined) emojiWidget.value = emoji;
		hbox.appendChild(emojiWidget);


		let optNitroIdWidget = GUI.newInput(optNitroId);
		optNitroIdWidget.placeholder = "nitro_id";
		optNitroIdWidget.style.width = "150px";
		if (optNitroId != undefined) optNitroIdWidget.value = optNitroId;
		hbox.appendChild(optNitroIdWidget);

		return hbox;
	}

	strToJson (str) {
		return str.split("\n").filter(i => i).map((element) => JSON.parse(`[${element}]`));
	}

	jsonToStr (animation) {
		if (animation == undefined) return ""

		let out = "";
		for (let i = 0; i < animation.length; i++) {
			out += JSON.stringify(animation[i]).substr(1).slice(0, -1) + "\n";
		}
		return out;
	}

	jsonToRichEdit (json) {
		let out = document.createElement("div");
		for (let i = 0; i < json.length; i++) {
			let row = undefined;
			if (json[i].length == 2) row = this.newRichRow(json[i][0], json[i][1]);
			else row = this.newRichRow(json[i][0], json[i][1], json[i][2]);

			if (i) row.style.marginTop = "15px";
			out.appendChild(row);
		}

		return out;
	}

	richEditToJson (editor) {
		return Array.prototype.slice.call(editor.childNodes).map((element) => {
				return Array.prototype.slice.call(element.childNodes)
					.filter(e => e.value.length)
					.map(e => e.value);
		}).filter(e => e.length);
	}

	// Settings
	getSettingsPanel () {
		let settings = document.createElement("div");
		settings.style.padding = "10px";

		settings.appendChild(GUI.newDivider());

		settings.appendChild(GUI.newLabel("Time per Keyframe (In milliseconds)"));
		let timeout = GUI.newInput();
		timeout.setAttribute("type", "number");
		timeout.addEventListener("focusout", () => {
			if (parseInt(timeout.value) < 1000) {
				timeout.value = "1000";
			}
		});
		timeout.value = this.getData("timeout");
		settings.appendChild(timeout);

		settings.appendChild(GUI.newDivider());

		settings.appendChild(GUI.newLabel('Animation'));
		let animationContainer = document.createElement("div");
		settings.appendChild(animationContainer);

		settings.appendChild(GUI.newDivider());
		let actions = GUI.newHBox();
		settings.appendChild(actions);

		let actionsRich = GUI.newHBox();

		let addStep = GUI.setSuggested(GUI.newButton("+", false));
		addStep.title = "Add step to end";
		addStep.onclick = () => {
			let row = this.newRichRow();
			if (editor.childNodes.length) row.style.marginTop = "15px";
			editor.appendChild(row);
		}
		actionsRich.appendChild(addStep);

		actionsRich.appendChild(GUI.newDivider());

		let delStep = GUI.setDestructive(GUI.newButton("-", false));
		delStep.title = "Remove last step";
		delStep.onclick = () => editor.removeChild(editor.childNodes[editor.childNodes.length - 1]);
		actionsRich.appendChild(delStep);

		let preferredEditor = this.getData("preferredEditor");
		let editor = undefined, animation = undefined;
		if (preferredEditor == "rich") {
			editor = this.jsonToRichEdit(this.getData("animation"));
			animationContainer.appendChild(editor);
			actionsRich.style.display = "flex";
		}
		else {
			animation = this.newRawEdit(this.jsonToStr(this.getData("animation")));
			animationContainer.appendChild(animation);
			actionsRich.style.display = "none";
		}

		let changeEditMode = GUI.newButton("Change Edit Mode");
		actions.appendChild(changeEditMode);

		changeEditMode.onclick = () => {
			let remove = undefined, append = undefined;

			try {
				if (preferredEditor == "rich") {
					animation = this.newRawEdit(this.jsonToStr(this.richEditToJson(editor)));
					[remove, append] = [editor, animation];
					actionsRich.style.display = "none";
				}
				else {
					editor = this.jsonToRichEdit(this.strToJson(animation.value));
					[remove, append] = [animation, editor];
					actionsRich.style.display = "flex";
				}
			}
			catch (e) {
				BdApi.showToast(e, {type: "error"})
				return;
			}

			preferredEditor = (preferredEditor == "rich" ? "raw" : "rich");
			animationContainer.appendChild(append);
			animationContainer.removeChild(remove);
			remove.remove();
		};

		actions.appendChild(GUI.newDivider());
		actions.appendChild(actionsRich);

		actions.appendChild(GUI.setExpand(GUI.newDivider(), 2));

		let save = GUI.newButton("Save");
		GUI.setSuggested(save, true);
		actions.appendChild(save);
		save.onclick = () => {
			try {

				this.setData("timeout", timeout.value);

				this.setData("preferredEditor", preferredEditor);

				if (preferredEditor == "rich")
					this.setData("animation", this.richEditToJson(editor));
				else
					this.setData("animation", this.strToJson(animation.value));
			}
			catch (e) {
				BdApi.showToast(e, {type: "error"});
				return;
			}

			BdApi.showToast("Settings were saved!", {type: "success"});

			this.load();
			this.stop();
			this.start();
		};
		return settings;
	}
}

/* Status API */
const Status = {
	authToken: Object.values(webpackJsonp.push([ [], { ['']: (_, e, r) => { e.cache = r.c } }, [ [''] ] ]).cache).find(m => m.exports && m.exports.default && m.exports.default.getToken !== void 0).exports.default.getToken(),

	strerror: (req) => {
		if (req.status < 400)
			return undefined;

		if (req.status == 401)
			return "Invalid AuthToken";

		let json = JSON.parse(req.response);
		for (const s of ["errors", "custom_status", "text", "_errors", 0, "message"])
			if ((json == undefined) || ((json = json[s]) == undefined))
				return "Internal. Report at github.com/BizcuitMild/Discord-Status";

		return json;
	},

	request: () => {
		let req = new XMLHttpRequest();
		req.open("PATCH", "/api/v8/users/@me/settings", true);
		req.setRequestHeader("authorization", Status.authToken);
		req.setRequestHeader("content-type", "application/json");
		req.onload = () => {
			let err = Status.strerror(req);
			if (err != undefined)
				BdApi.showToast(`Animated Status: Error: ${err}`, {type: "error"});
		};
		return req;
	},

	set: (status) => {
		let data = {};

		if (status.length == 0) return;
		if (status.length >= 1) data.text = status[0];
		if (status.length >= 2) data.emoji_name = status[1];
		if (status.length >= 3) data.emoji_id = status[2];

		Status.request().send(JSON.stringify({custom_status: data}));
	},

	unset: () => {
		Status.request().send('{"custom_status":null}');
	}
};

const GUI = {
	newInput: (text = "") => {
		let input = document.createElement("input");
		input.className = "inputDefault-_djjkz input-cIJ7To";
		input.innerText = text;
		return input;
	},

	newLabel: (text) => {
		let label = document.createElement("h5");
		label.className = "h5-18_1nd";
		label.innerText = text;
		return label;
	},

	newDivider: (size = "15px") => {
		let divider = document.createElement("div");
		divider.style.minHeight = size;
		divider.style.minWidth = size;
		return divider;
	},

	newTextarea: () => {
		let textarea = document.createElement("textarea");
		textarea.className = "input-cIJ7To scrollbarGhostHairline-1mSOM1";
		textarea.style.resize = "vertical";
		textarea.rows = 4;
		return textarea;
	},

	newButton: (text, filled = true) => {
		let button = document.createElement("button");
		button.className = "button-38aScr colorBrand-3pXr91 sizeSmall-2cSMqn grow-q77ONN";
		if (filled) button.classList.add("lookFilled-1Gx00P");
		else button.classList.add("lookOutlined-3sRXeN");
		button.innerText = text;
		return button;
	},

	newHBox: () => {
		let hbox = document.createElement("div");
		hbox.style.display = "flex";
		hbox.style.flexDirection = "row";
		return hbox;
	},

	setExpand: (element, value) => {
		element.style.flexGrow = value;
		return element;
	},

	setSuggested: (element, value = true) => {
		if (value) element.classList.add("colorGreen-29iAKY");
		else element.classList.remove("mystyle");
		return element;
	},

	setDestructive: (element, value = true) => {
		if (value) element.classList.add("colorRed-1TFJan");
		else element.classList.remove("colorRed-1TFJan");
		return element;
	}
};
