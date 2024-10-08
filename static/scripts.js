'use strict';
// Блоки интерфейса
const col_buts = document.querySelector('.cols').children;
// const out = document.querySelector('.out');
const thead = document.querySelector('.thead');
const tbody = document.querySelector('.tbody');

// Кнопки нижнего блока
const help = document.querySelector('#help');

help.onclick = getCpumem;

// Массив выбранных колонок
let conf = { columns: [], sort: '' };

// Проверка/инициализация хранилища
if (!localStorage.getItem('webtop-conf')) {
	localStorage.setItem('webtop-conf', JSON.stringify({ columns: [], sort: '' }));
} else {
	conf = JSON.parse(localStorage.getItem('webtop-conf'));
	console.log(conf);
}

drawTHead(conf.columns);

for (let el of col_buts) {
	if (conf.columns.includes(el.id)) {
		el.classList.add('active');
	}
	el.addEventListener('click', chooseColumn);
}

setInterval(() => {
	getProcesses();
}, 400);

// Функция выбора сортировки
function chooseSort(e, colName) {
	console.log(colName);
	for (let el of document.querySelectorAll('th')) {
		el.classList.remove('active');
	}
	e.currentTarget.classList.add('active');

	conf.sort = colName;
}

// Функция добавления/удаления колонок
function chooseColumn(e) {
	let t = e.currentTarget;
	if (conf.columns.includes(t.id)) {
		t.classList.remove('active');
		conf.columns = conf.columns.filter(el => el != t.id);
	} else {
		t.classList.add('active');
		conf.columns.push(t.id);
	}
	console.log(conf.columns);
	drawTHead(conf.columns);
}

// Функция запроса данных о процессах
async function getProcesses() {
	let body = JSON.stringify(conf);
	localStorage.setItem('webtop-conf', body);
	let res = await fetch('/api/processes', {
		method: 'POST',
		body,
	});
	res = await res.json();
	drawTBody(res);
}

// Функция запроса информации загрузки каждого процесса
async function getCpumem() {
	/**
	i = idle + iowait
	b = user + nice + system + irq + softirq + steal
	t = i + b
	pcpu = 100% * b / t
	*/
	console.clear();
	let res = await fetch('/api/cpumem');
	res = await res.text();
	let arr = res.trim().split('\n');
	for (let el of arr) {
		let str = el.split(/\s+/g);
		// let i = +str[4] + +str[5];
		let b = +str[1] + +str[2] + +str[3] + +str[4] + +str[5] + +str[6] + +str[7] + +str[8];
		// let t = i + b;
		// let pcpu = console.log(pcpu.toFixed(2) + '%');
		console.log(el);
		console.log(+str[4] / b / 100);
	}
}

// Функция отрисовки тела таблицы
function drawTBody(res) {
	tbody.innerHTML = '';
	let y = [];
	for (let i = 0; i < res.length; i++) {
		let tr = document.createElement('tr');

		let str = res[i].trim().split(/\s+/g);

		if (i < 10000) {
			for (let k = 0; k < conf.columns.length; k++) {
				let td = document.createElement('td');
				td.innerText = str[k];
				tr.append(td);
			}
		}

		tbody.append(tr);
	}
}

// Функция отрисовки шапки таблицы
function drawTHead(res) {
	thead.innerHTML = '';
	let tr = document.createElement('tr');

	for (let p of res) {
		let th = document.createElement('th');
		th.innerText = p.toUpperCase();
		th.onclick = e => chooseSort(e, p.toLowerCase());
		if (p == conf.sort) {
			th.classList.add('active');
		}
		tr.append(th);
	}

	thead.append(tr);
}
