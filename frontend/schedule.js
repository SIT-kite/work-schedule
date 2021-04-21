const id = _ => document.getElementById(_),

schedule  = id("schedule"),
weekInput = id("week"),
people    = id("people"),

set     = id("set"),
cancel  = id("cancel"),
all     = id("all"),
reverse = id("reverse"),
clear   = id("clear");


// localStorage.getItem("schedule")


weekInput.addEventListener(
	"input", () => weekInput.reportValidity()
);

const peopleInfo = people.textContent;

let td;

const selectTd = _td => {
	td = _td;
	document.querySelectorAll(
		'#schedule .selected, #schedule .error'
	).forEach(
		element => element.classList.remove("selected", "error")
	);
	td.classList.add("selected");
	weekInput.disabled = true;
	people.textContent = "";
};

const cancelSelectTd = () => {
	td.classList.remove("selected", "error");
	td = undefined;
	weekInput.disabled = false;
	people.textContent = peopleInfo;
};

const setError = message => {
	td.classList.add("error");
	return people.textContent = message;
};

// addPeople(result)
// 把获取到的人员加到 #people 里
const addPeople = result => {

	// 清除 "正在获取人员…"
	people.textContent = "";

	result.forEach(
		person => {

			const input = document.createElement("input");
			const label = document.createElement("label");

			input.type = "checkbox";
			input.data = person;
			input.checked = td.textContent.includes(person.name);

			label.textContent = person.name;
			label.title = person.id + " " + person.group;

			label.prepend(input);
			people.append(label);

		}
	);

}

// fetchPeople(body)
// 获取人员，调用 addPeople()
const fetchPeople = body => fetch(
	"schedule.test.json", {
		method: "POST",
		body
	}
).then(
	response => {
		if ( response.status !== 200 ) {
			throw setError("服务器炸了");
		} else {
			return response.json();
		}
	}
).then(
	json => {
		if ( !("result" in json) || !Array.isArray(json.result) ) {
			throw setError("服务器返回的数据格式有误");
		} else {
			addPeople(json.result);
		}
	}
);

const indexMap = new Map([
	[ 1, "1-2" ],
	[ 3, "3-4" ],
	[ 5, "5-6" ],
	[ 7, "7-8" ],
	[ 9, "9-11" ]
]);

// showPeople
// 显示人员，准备获取人员所需的数据，调用 fetchPeople()
const showPeople = () => {

	const week = Number.parseInt(weekInput.value);
	const day = td.cellIndex;

	const rowIndex = td.parentNode.rowIndex;
	const index = indexMap.get(rowIndex);

	if ( !Number.isInteger(week) ) {
		setError("未输入周数或周数有误！请点击“取消”并修正");
	} else if ( !Number.isInteger(day) || day < 1 || day > 5 ) {
		setError("星期有误！请联系技术部解决");
	} else if ( !indexMap.has(rowIndex) ) {
		setError("时间有误！请联系技术部解决");
	} else {
		people.textContent = "正在获取人员…";
		const formData = new FormData();
		formData.set("week", week);
		formData.set("day", day);
		formData.set("index", index);
		fetchPeople(formData);
	}

};

schedule.addEventListener(
	"click", event => {

		const target = event.target;

		if ( target.tagName === "TD" ) {
			if ( target.classList.contains("selected") ) {
				cancelSelectTd();
			} else {
				selectTd(target);
				showPeople();
			}
		}

	}
);

const checkboxSelector = '#people input[type="checkbox"]';
const checkboxSelectors = {
	all: checkboxSelector,
	checked: checkboxSelector + ':checked',
	notChecked: checkboxSelector + ':not(:checked)'
};
const selectCheckboxes = type => document.querySelectorAll(
	checkboxSelectors[type]
);

// 安排
set.addEventListener(
	"click", () => {
		td.innerHTML =
		Array.from( selectCheckboxes("checked") ).map(
			checkbox => checkbox.data.name
		).join("<br>");
	}
);

// 取消
cancel.addEventListener("click", cancelSelectTd);

// 全选
all.addEventListener(
	"click", () => selectCheckboxes("notChecked").forEach(
		checkbox => checkbox.checked = true
	)
);

// 反选
reverse.addEventListener(
	"click", () => selectCheckboxes("all").forEach(
		checkbox => checkbox.checked = !checkbox.checked
	)
);

// 清空
clear.addEventListener(
	"click", () => selectCheckboxes("checked").forEach(
		checkbox => checkbox.checked = false
	)
);
