var fields = {};
var rules = {};

// Function to generate a dynamic form from JSON
function generateForm() {
    let form = document.getElementById('dynamic-form');

    window.fields.forEach(field => {
        switch (field.type) {
            case 'radio':
                form.appendChild(radioInput(field));
                break;
            default:
                form.appendChild(textInput(field));
        }
    });
}

// Function to generate rules on dyanamic form from JSON
function generateRules() {
    window.rules.forEach(rule => {
        switch (rule.type) {
            case 'show':
                window.showRule(rule);
                break;
            case 'valid':
                window.validRule(rule);
                break;
            default:
        }
    });
}

// Function to generate form block for a standard text input
function textInput(field) {
    let formblock = formBlock(field.name);

    formblock.appendChild(label(field.name, field.label));

    formblock.appendChild(input(field.name, '', field.type));

    return formblock;
}

// Function to generate form block for a radio group
function radioInput(field) {
    let formblock = formBlock(field.name);

    formblock.appendChild(label(field.name, field.label, field.type));

    let radiogroup = document.createElement('div');

    field.options.forEach(option => {
        radiogroup.setAttribute('id', field.name);

        radiogroup.appendChild(label(field.name, option));
    
        radiogroup.appendChild(input(field.name, option, field.type));
    });

    formblock.appendChild(radiogroup);

    return formblock;
}

// Function to generate form block element
function formBlock(fieldName) {
    let formblock = document.createElement('div');

    formblock.classList.add('form-block');
    formblock.setAttribute('id', fieldName);

    return formblock;
}

// Function to generate labels for forms
function label(fieldName, fieldLabel) {
    let label = document.createElement('label');

    label.setAttribute('for', fieldName);
    label.textContent = fieldLabel;

    return label;
}

// Function to generate inputs for forms
function input(fieldName, fieldValue, fieldType) {
    let input = document.createElement('input');

    input.setAttribute('name', fieldName);
    input.setAttribute('value', fieldValue);
    input.setAttribute('type', fieldType);

    return input;
}

// Function to check show rules for the form
function showRule(rule) {
    let hidden = document.getElementById(rule.on);
    let show = document.getElementById(rule.from).children[rule.from];

    hidden.classList.add('hidden');

    show.addEventListener('keyup', showInputChange);
}

// Event listener to show or hide parts of the form based on information entered by the user
function showInputChange() {
    let input = this.getAttribute('name');

    let currRules = rules.filter(function(el) {
        return el.type === 'show' &&
            el.from === input;
    });

    currRules.forEach(rule => {
        let hidden = document.getElementById(rule.on);
        if (rule.hasOwnProperty('gte')) {
            if (parseInt(this.value) >= rule.gte) {
                hidden.classList.remove('hidden');
            } else {
                hidden.classList.add('hidden');
            }
        }
    });

}

// Function to check validation rules for the form
function validRule(rule) {
    let valid = document.getElementById(rule.on);
    let match = document.getElementById(rule.from);
    if (rule.hasOwnProperty('required')) {
        if (rule.required === true) {
            valid.children[rule.on].setAttribute('required', 'required');

            let errorMsg = document.createElement('div');
            errorMsg.classList.add('form-error', 'required', 'hidden');
            errorMsg.innerText = valid.children[0].innerText + ' field must be filled.';
            valid.appendChild(errorMsg);

            valid.children[rule.on].addEventListener('keyup', reqInputChange);
        }
    } else if (rule.hasOwnProperty('pattern')) {
        let errorMsg = document.createElement('div');
        errorMsg.classList.add('form-error', 'pattern', 'hidden');
        errorMsg.innerText = 'Field must be a valid ' + valid.children[0].innerText + '.';
        valid.appendChild(errorMsg);

        valid.children[rule.on].addEventListener('keyup', patInputChange);
    } else if (rule.hasOwnProperty('match')) {
        let errorMsg = document.createElement('div');
        errorMsg.classList.add('form-error', 'match', 'hidden');
        errorMsg.innerText = valid.children[0].innerText + ' field must match ' + match.children[0].innerText + ' field.';
        valid.appendChild(errorMsg);

        valid.children[rule.on].addEventListener('keyup', matInputChange);
        match.children[rule.from].addEventListener('keyup', matInputChange);
    }
}

// Event listener to check that a field has been filled
function reqInputChange() {
    if (this.value === '') {
        window.showError(this.parentNode, 'required');
    } else {
        window.hideError(this.parentNode, 'required');
    }
}

// Event listener to check that a field matches the pattern it should
function patInputChange() {
    let input = this.getAttribute('name');

    let currRules = rules.filter(function(el) {
        return el.pattern &&
            el.on === input
    });

    currRules.forEach(rule => {
        let regex = new RegExp(rule.pattern);
        if (regex.test(this.value) === false) {
            window.showError(this.parentNode, 'pattern');
        } else {
            window.hideError(this.parentNode, 'pattern');
        }
    });
}

// Event listener to check that fields match
function matInputChange() {
    let input = this.getAttribute('name');

    let currRules = rules.filter(function(el) {
        return el.match &&
            (el.on === input || el.from === input)
    });

    currRules.forEach(rule => {
        let valid = document.getElementById(rule.on);
        let match = document.getElementById(rule.from);

        if (valid.children[rule.on].value === match.children[rule.from].value) {
            window.hideError(valid, 'match');
        } else {
            window.showError(valid, 'match');
        }
    });
}

// Function to show error blocks to the user
function showError(formBlock, errorType) {
    Array.from(formBlock.children).forEach(el => {
        if (el.classList.contains(errorType)) {
            el.classList.remove('hidden');
        }
    });
}

// Function to hide error blocks from the user
function hideError(formBlock, errorType) {
    Array.from(formBlock.children).forEach(el => {
        if (el.classList.contains(errorType)) {
            el.classList.add('hidden');
        }
    });
}

// Function to parse JSON data
function dataParser() {
    let response = JSON.parse(this.responseText);
    window.fields = response.fields;
    window.rules = response.rules;

    generateForm();
    generateRules();
}

// Function to get JSON from file for parsing
function getJSON() {
    let xhr = new XMLHttpRequest();

    xhr.addEventListener('load', dataParser);
    xhr.open('GET', 'form.json', true);
    xhr.send();
}