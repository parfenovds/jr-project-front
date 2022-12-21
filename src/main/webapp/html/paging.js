'use strict'
formList();
initOrChangeTable();
prepareForm();

let lastClickedButton;

function formList() {
    let select = document.getElementById("sl");
    let option = document.createElement('option');
    for (let i = 3; i <= 20; i++) {
        let opt = option.cloneNode(false);
        opt.appendChild(document.createTextNode(i));
        select.appendChild(opt);
    }
}

async function formButtons(amountOfRows, markedButton) {
    let accountNumber = await fetch("/rest/players/count")
        .then(response => response.text());
    let amountOfButtons = Math.ceil(accountNumber / amountOfRows);
    let buttons = document.getElementById("buttons");
    let button = document.createElement('button');
    while (buttons.firstChild) {
        buttons.removeChild(buttons.lastChild);
    }
    let elementById = document.getElementById("sl");
    let value = elementById.options[elementById.selectedIndex].value;
    for (let i = 1; i <= amountOfButtons; i++) {
        let but = button.cloneNode(false);
        if (i === markedButton) {
            but.setAttribute("id", "pageButtonRed");
            lastClickedButton = but;
        } else {
            but.setAttribute("id", "pageButton");
        }
        but.onclick = function () {
            but.setAttribute("id", "pageButtonRed");
            if (lastClickedButton != null) {
                lastClickedButton.setAttribute("id", "pageButton");
            }
            setTable(value, i - 1);
            lastClickedButton = but;
        }
        but.appendChild(document.createTextNode(i));
        buttons.appendChild(but);
    }
}

function initOrChangeTable(e) {
    if (e === undefined) {
        tableHeadersFormating();
        setTable(3, 0);
        formButtons(3, 1);

    } else {
        let elementById = document.getElementById("sl");
        let value = elementById.options[elementById.selectedIndex].value;
        setTable(value, 0);
        formButtons(e.value, 1);
    }
}
