'use strict'

const banned = {
    false: 'false',
    true: 'true',
}

const race = {
    HUMAN: "HUMAN",
    DWARF: "DWARF",
    ELF: "ELF",
    GIANT: "GIANT",
    ORC: "ORC",
    TROLL: "TROLL",
    HOBBIT: "HOBBIT",
}

const profession = {
    WARRIOR: "WARRIOR",
    ROGUE: "ROGUE",
    SORCERER: "SORCERER",
    CLERIC: "CLERIC",
    PALADIN: "PALADIN",
    NAZGUL: "NAZGUL",
    WARLOCK: "WARLOCK",
    DRUID: "DRUID",
}

const arrOfIterable = [race, profession, banned];

const fields = ['id', 'name', 'title', 'race', 'profession', 'level', 'birthday', 'banned', 'edit', 'delete'];

const editableFields = ['name', 'title', 'race', 'profession', 'banned'];

const smallEditableFields = ['race', 'profession', 'banned'];

let currentPage = 1;


const headerNames = ['#', 'Name', 'Title', 'Race', 'Profession', 'Level', 'Birthday', 'Banned', 'Edit', 'Delete'];

function tableHeadersFormating() {
    let table = document.getElementById("styled-table");
    let htmlElement = document.createElement('thead');
    let htmlTableRowElement = document.createElement('tr');
    let htmlTableCellElement = document.createElement('th');
    let thead = htmlElement.cloneNode(false);
    let tr = htmlTableRowElement.cloneNode(false);
    for (let i = 0; i < headerNames.length; i++) {
        let th = htmlTableCellElement.cloneNode(false);
        th.appendChild(document.createTextNode(headerNames[i]));
        tr.appendChild(th);
        thead.appendChild(tr);
    }
    table.appendChild(thead);
}

function appendOptChild(option, f, select) {
    let opt = option.cloneNode(false);
    opt.appendChild(document.createTextNode(f));
    select.appendChild(opt);
}

function selConstruct(id, name, oldItem, element, iterableObj) {
    let txt = oldItem.innerText;
    let select = document.createElement('select');
    select.setAttribute("id", name + "_" + id);
    select.setAttribute("class", "selectField");
    let option = document.createElement('option');
    appendOptChild(option, txt, select);
    for (let f in iterableObj) {
        if (f === txt) continue;
        appendOptChild(option, f, select);
    }
    element.appendChild(select);
    oldItem.replaceWith(element);
}

function defaultSelConstruct(oldItem, k, id, element) {
    let text = oldItem.innerText;
    let newItem = document.createElement("input");
    newItem.style.width = text.length + 2 + "ch";
    newItem.setAttribute("class", "inputField");
    newItem.setAttribute("id", editableFields[k] + "_" + id);
    newItem.value = text;
    element.appendChild(newItem);
    oldItem.replaceWith(element);
}

function editButtonEvent(id, but) {
    let deleteButton = document.getElementById("deleteButton" + id);
    deleteButton.style.visibility = 'hidden';
    but.setAttribute("class", "saveButton");
    for (let k = 0; k < editableFields.length; k++) {
        let element = document.createElement('td');
        let oldItem = document.getElementById(editableFields[k] + "_" + id);
        switch (editableFields[k]) {
            case 'race':
                selConstruct(id, 'race', oldItem, element, race);
                break;
            case 'profession':
                selConstruct(id, 'profession', oldItem, element, profession);
                break;
            case 'banned':
                selConstruct(id, 'banned', oldItem, element, banned);
                break;
            default:
                defaultSelConstruct(oldItem, k, id, element);
                break;
        }
    }
}

async function saveButtonEvent(id, but) {
    let retObj = {
        name: null,
        title: null,
        race: null,
        profession: null,
        banned: null,
    }
    for (let key in retObj) {
        let field = document.getElementById(key + "_" + id);
        if (field.getAttribute("class") === "inputField") {
            retObj[key] = field.value;
        } else {
            retObj[key] = field.options[field.selectedIndex].text;
        }
    }
    await fetch('/rest/players/' + id, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(retObj)
    });
    let deleteButton = document.getElementById("deleteButton" + id);
    deleteButton.style.visibility = 'visible';
    but.setAttribute("class", "editButton");
    let pageSelector = document.getElementById("sl");
    let pageSize = pageSelector.value;
    rebuildTable(pageSize, currentPage);
}

function setEditButtonEvent(but, id) {
    but.onclick = function () {
        if (but.getAttribute("class") !== "saveButton") {
            editButtonEvent(id, but);
        } else {
            saveButtonEvent(id, but);
        }
    }
}


async function rebuildTable(pageSize, pageNumber) {
    let response = await fetch("/rest/players?pageSize=" + pageSize + "&pageNumber=" + pageNumber)
        .then(response => response.text());
    let newPageNumber;
    if (response.length === 2 && pageNumber > 0) {
        newPageNumber = pageNumber - 1;
    } else {
        newPageNumber = pageNumber;
    }
    setTable(pageSize, newPageNumber);
    let elementById = document.getElementById("sl");
    formButtons(elementById.options[elementById.selectedIndex].value, newPageNumber + 1);
}

function clearPreviousTable(table) {
    while (table.childElementCount > 1) {
        table.removeChild(table.lastChild);
    }
}

async function setTable(pageSize, pageNumber) {
    let response = await fetch("/rest/players?pageSize=" + pageSize + "&pageNumber=" + pageNumber)
        .then(response => response.text());
    let json = JSON.parse(response);
    let arr = fields;
    let table = document.getElementById("styled-table");
    let htmlTableSectionElement = document.createElement('tbody');
    let htmlTableRowElement = document.createElement('tr');
    let htmlTableCellElement1 = document.createElement('td');
    let node = htmlTableSectionElement.cloneNode(false);
    let button = document.createElement('button');

    clearPreviousTable(table);

    for (let i = 0; i < json.length; i++) {
        let tr = htmlTableRowElement.cloneNode(false);
        let id;
        for (let j = 0; j < arr.length; j++) {
            let td = htmlTableCellElement1.cloneNode(false);
            let value;
            if (arr[j] === "id") {
                id = json[i][arr[j]];
            }
            if (arr[j] === "birthday") {
                let date = new Date(json[i][arr[j]]);
                value = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
                td.appendChild(document.createTextNode(value));
            } else if (arr[j] === "edit") {
                let but = button.cloneNode(false);
                but.setAttribute("class", "editButton");
                but.setAttribute("id", "editButton" + id);
                setEditButtonEvent(but, id);
                td.appendChild(but);
            } else if (arr[j] === "delete") {
                let but = button.cloneNode(false);
                but.setAttribute("id", "deleteButton" + id);
                but.setAttribute("class", "deleteButton");
                but.onclick = async function () {
                    console.log("delete " + id);
                    await fetch("/rest/players/" + id, {method: 'DELETE'});
                    await rebuildTable(pageSize, pageNumber);
                }
                td.appendChild(but);
            } else {
                value = json[i][arr[j]];
                td.appendChild(document.createTextNode(value));
                td.setAttribute("id", arr[j] + "_" + id);
            }
            tr.appendChild(td);
        }
        node.appendChild(tr);
    }
    table.appendChild(node);
    currentPage = pageNumber;
}

function formButtonSel(element, iterableObj) {
    let option = document.createElement('option');
    for (let f in iterableObj) {
        let opt = option.cloneNode(false);
        opt.appendChild(document.createTextNode(f));
        element.appendChild(opt);
    }
}

function prepareForm() {
    for (let i = 0; i < smallEditableFields.length; i++) {
        let inp = document.getElementById(smallEditableFields[i] + "Input");
        formButtonSel(inp, arrOfIterable[i]);
    }
}

async function saveButtonClickEvent() {
    let retObj = {
        name: null,
        title: null,
        race: null,
        profession: null,
        birthday: null,
        banned: null,
        level: null,
    }

    for (let key in retObj) {
        let field = document.getElementById(key + "Input");
        if (field.getAttribute("id") === "birthdayInput") {
            retObj[key] = new Date(field.value).getTime();
        } else if (field.getAttribute("class") === "accInputField") {
            retObj[key] = field.value;
        } else {
            retObj[key] = field.options[field.selectedIndex].text;
        }
    }

    await fetch('/rest/players/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(retObj)
    });
    let pageSelector = document.getElementById("sl");
    let pageSize = pageSelector.value;
    rebuildTable(pageSize, currentPage);
    clearInputs();
}

function clearInputs() {
    for (let i = 0; i < editableFields.length; i++) {
        let field = document.getElementById(editableFields[i] + "Input");
        field.value = null;
    }
}
