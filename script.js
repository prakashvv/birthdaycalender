var COLOR_NAMES = ["Blue", "Brown", "DarkGrey", "DarkGreen", "DarkRed", "DarkViolet", "GreenYellow", "Maroon", "Olive",
    "OliveDrab", "Orange", "OrangeRed", "Orchid", "PaleGreen", "Peru", "Purple"];

var CONSTANTS = {
    /* inputs */
    DISPLAY_MODE: "mode",
    JSON_INPUT: "input",
    FILTER_YEAR: "year",

    /* divs */
    CALENDER: "calender",

    /* html */
    PARAGRAPH: "P",
    DIVISION: "DIV",
    CLASS: "CLASS",
    ID: "ID",
    H1: "H1",
    TABLE: "TABLE",
    TABLE_ROW: "TR",
    TABLE_COLUMN: "TD",
    HEIGHT: "height",
    WIDTH: "width",

    /* CSS */
    CLASS_CARD: "card",
    CLASS_CARD_FILL: "card-fill",
    CLASS_HEADER_TEXT: "header-text",
    CLASS_CARD_FILL_WHITE: "card-fill-white",
    CLASS_CARD_TABLE: "card-table",
    CLASS_CARD_ROW: "card-row",
    CLASS_CARD_COLUMN: "card-column",

    /* message */
    JSON_FORMAT_INVALID: "Entered data is not correctly formatted. Please validate the provided JSON text.",
    YEAR_FORMAT_INVALID: "Entered year is not valid. Please input only numbers in year.",
    NO_BIRTHDAYS: "No birthdays today",

    /* regex */
    YEAR_FORMAT: /\D/,
    DATE_FORMAT: /^(0?[1-9]|1[012])[\/](0?[1-9]|[12][0-9]|3[01])[\/]\d{4}$/,

    /* display modes */
    MODE_WEEK: 0,
    MODE_MONTH: 1,

    /* others */
    COLOR_GREY: "grey",
    NO_NAME: "??"
}

/***********************************************************************
 * updateCalender = Update calender function
 * Handles
 * 1. reading the inputs from textarea and year input box
 * 2. cleanup the calender sub-tree
 * 3. validate inputs and throw error if inputs are not valid
 * 4. categorize each birth date and place it in appropriate bucket(day of week or day of month)
 * 5. generate cards and use the categorized data to fill up each cards
 ***********************************************************************/
function updateCalender() {
    var weekDays = [{name: "MON"}, {name: "TUE"}, {name: "WED"}, {name: "THU"}, {name: "FRI"}, {name: "SAT"}, {name: "SUN"}];
    var monthDays = [{name: "1"}, {name: "2"}, {name: "3"}, {name: "4"}, {name: "5"}, {name: "6"}, {name: "7"},
        {name: "8"}, {name: "9"}, {name: "10"}, {name: "11"}, {name: "12"}, {name: "13"}, {name: "14"},
        {name: "15"}, {name: "16"}, {name: "17"}, {name: "18"}, {name: "19"}, {name: "20"}, {name: "21"},
        {name: "22"}, {name: "23"}, {name: "24"}, {name: "25"}, {name: "26"}, {name: "27"}, {name: "28"},
        {name: "29"}, {name: "30"}, {name: "31"}];

    var modeValue = document.getElementById(CONSTANTS.DISPLAY_MODE).selectedIndex;
    var calenderType = (modeValue == CONSTANTS.MODE_WEEK) ? weekDays : monthDays;

    var jsonText = document.getElementById(CONSTANTS.JSON_INPUT).value;
    var yearToCheck = document.getElementById(CONSTANTS.FILTER_YEAR).value;

    var calenderElement = document.getElementById(CONSTANTS.CALENDER);
    while (calenderElement.hasChildNodes()) {
        calenderElement.removeChild(calenderElement.lastChild);
    }

    var birthDates;
    try {
        birthDates = JSON.parse(jsonText);
    } catch (e) {
        var errorMessage = document.createElement(CONSTANTS.PARAGRAPH);
        errorMessage.innerHTML = CONSTANTS.JSON_FORMAT_INVALID;
        calenderElement.appendChild(errorMessage);
        return;
    }
    if (!(birthDates.constructor == Array)) {
        birthDates = [birthDates];
    }

    if (CONSTANTS.YEAR_FORMAT.test(yearToCheck)) {
        var errorMessage = document.createElement(CONSTANTS.PARAGRAPH);
        errorMessage.innerHTML = CONSTANTS.YEAR_FORMAT_INVALID;
        calenderElement.appendChild(errorMessage);
        return;
    }
    yearToCheck = Number(yearToCheck);

    /* 4. categorize each birth date and place it in appropriate bucket(day of week or day of month) */
    for (var index = 0; index < birthDates.length; index++)
        processBirthDate(birthDates[index], calenderType, yearToCheck, modeValue);

    /* 5. generate cards and use the categorized data to fill up each cards */
    calenderType.forEach(fillCards);
}

/***********************************************************************
 * processBirthDate = 4. categorize each birth date and place it in appropriate bucket(day of week or day of month)
 *
 * based on getDay() or getDate() value, the details will be placed in persons array of calenderDays
 ************************************************************************/
function processBirthDate(birthDateObj, calenderDays, yearToCheck, modeValue) {
    if (!birthDateObj.birthday)
        return;

    if (!birthDateObj.birthday.toString().match(CONSTANTS.DATE_FORMAT))
        return; // this can be changed to show some indication about invalid date format

    var birthDate = new Date(birthDateObj.birthday);
    if (yearToCheck == birthDate.getFullYear()) {
        var index = (modeValue == CONSTANTS.MODE_WEEK) ? ((birthDate.getDay() + 6) % 7) : (birthDate.getDate() - 1);
        if (calenderDays[index].persons)
            calenderDays[index].persons.push({
                initials: getPersonInitials(birthDateObj.name),
                elapsed: birthDate.getTime()
            });
        else
            calenderDays[index].persons = [{
                initials: getPersonInitials(birthDateObj.name),
                elapsed: birthDate.getTime()
            }];
    }
}

/***********************************************************************
 * fillCards = 5. generate cards and use the categorized data to fill up each cards
 *
 * 1. generate the DOM for a card based on dayToFill values
 * 2. create table based on persons array
 ************************************************************************/
function fillCards(dayToFill) {
    var calenderElement = document.getElementById(CONSTANTS.CALENDER);

    var cardElement = document.createElement(CONSTANTS.DIVISION);
    cardElement.setAttribute(CONSTANTS.CLASS, CONSTANTS.CLASS_CARD);
    cardElement.setAttribute(CONSTANTS.ID, dayToFill.name);

    var divFill = document.createElement(CONSTANTS.DIVISION);
    divFill.setAttribute(CONSTANTS.CLASS, CONSTANTS.CLASS_CARD_FILL);

    var heading = document.createElement(CONSTANTS.H1);
    heading.setAttribute(CONSTANTS.CLASS, CONSTANTS.CLASS_HEADER_TEXT);
    heading.innerHTML = dayToFill.name;
    divFill.appendChild(heading);

    var subDiv = document.createElement(CONSTANTS.DIVISION);
    subDiv.setAttribute(CONSTANTS.CLASS, CONSTANTS.CLASS_CARD_FILL_WHITE);
    subDiv.appendChild(getTableElement(dayToFill.persons));
    divFill.appendChild(subDiv);

    cardElement.appendChild(divFill);
    calenderElement.appendChild(cardElement);
}

/***********************************************************************
 * getTableElement = helper function to generate inner table for a card
 *
 * 1. sort birth days based on youngest to oldest
 * 2. find out what number of rows and columns will be required to accommodate the number of entries in persons array
 * 3. outer loop generates rows for each set of persons
 * 4. inner loop generates columns for each person in the current row
 * 5. show No birthdays message if no persons has birthday
 ************************************************************************/
function getTableElement(persons) {
    var tableElement = document.createElement(CONSTANTS.TABLE);
    tableElement.setAttribute(CONSTANTS.CLASS, CONSTANTS.CLASS_CARD_TABLE);
    if (persons && persons.length > 0) {
        /* 1. sort birth days based on youngest to oldest */
        persons = persons.sort(function (person1, person2) {
            return person2.elapsed - person1.elapsed
        });

        /* 2. find out what number of rows and columns will be required to accommodate the number of entries in persons array */
        var squareRoot = Math.sqrt(persons.length);
        var nextPerfectSquareRoot = Math.floor(squareRoot) + (squareRoot == parseInt(squareRoot) ? 0 : 1);

        // generate the table cells
        var personIndex = 0;
        for (var row = 0; row < nextPerfectSquareRoot; row++) {
            var rowElement = document.createElement(CONSTANTS.TABLE_ROW);
            rowElement.setAttribute(CONSTANTS.CLASS, CONSTANTS.CLASS_CARD_ROW);
            rowElement.setAttribute(CONSTANTS.HEIGHT, (100 / nextPerfectSquareRoot) + "%");
            for (var column = 0; column < nextPerfectSquareRoot; column++) {
                var columnElement = document.createElement(CONSTANTS.TABLE_COLUMN);
                columnElement.setAttribute(CONSTANTS.CLASS, CONSTANTS.CLASS_CARD_COLUMN);
                columnElement.setAttribute(CONSTANTS.WIDTH, (100 / nextPerfectSquareRoot) + "%");
                if (persons[personIndex]) {
                    columnElement.style.backgroundColor = COLOR_NAMES[personIndex % COLOR_NAMES.length];
                    columnElement.innerHTML = persons[personIndex++].initials;
                }
                rowElement.appendChild(columnElement);
            }
            tableElement.appendChild(rowElement);
        }
    }
    else {
        // empty table
        var rowElement = document.createElement(CONSTANTS.TABLE_ROW);
        var columnElement = document.createElement(CONSTANTS.TABLE_COLUMN);
        rowElement.setAttribute(CONSTANTS.CLASS, CONSTANTS.CLASS_CARD_ROW);
        rowElement.setAttribute(CONSTANTS.HEIGHT, "100%");

        columnElement.setAttribute(CONSTANTS.CLASS, CONSTANTS.CLASS_CARD_COLUMN);
        columnElement.setAttribute(CONSTANTS.WIDTH, "100%");
        columnElement.style.backgroundColor = CONSTANTS.COLOR_GREY;

        columnElement.innerHTML = CONSTANTS.NO_BIRTHDAYS;

        rowElement.appendChild(columnElement);
        tableElement.appendChild(rowElement);
    }
    return tableElement;
}

/***********************************************************************
 * getPersonInitials = helper function to get upper cased initials for each person name
 *
 * first character of first word and first character of last word is used to generate initials
 ************************************************************************/
function getPersonInitials(personName) {
    if (!personName || personName.length == 0 || typeof personName != "string")
        return CONSTANTS.NO_NAME;

    var spaceIndex = personName.lastIndexOf(' ');
    return personName.charAt(0).toUpperCase() + ((spaceIndex > -1 && personName.length > (spaceIndex + 1)) ? personName.charAt(spaceIndex + 1) : '').toUpperCase();
}