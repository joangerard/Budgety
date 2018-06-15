var budgetController = (function () {
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    Expense.prototype.calculatePercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value /totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    }
    
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }
    
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var addItem = function (type, desc, val) {
        var newItem, ID, lastPosition;
        
        lastPosition = data.allItems[type].length - 1;
        
        if(lastPosition >= 0){
            ID = data.allItems[type][lastPosition].id + 1;
        } else {
            ID = 0;
        }
        
        if (type === 'exp') {
            newItem = new Expense(ID, desc, val);
        } else if (type === 'inc') {
            newItem = new Income(ID, desc, val);
        }
        
        data.allItems[type].push(newItem);
        
        return newItem;
    };
    
    var deleteItem = function(type, id){
        // id = 3
        var ids = data.allItems[type].map(function (current) {
            return current.id;
        })
        
        var index = ids.indexOf(id);
        
        if (index !== -1) {
            data.allItems[type].splice(index, 1);
        }
    };
    
    var calculateTotal = function (type) {
        var sum = 0;
        
        data.allItems[type].forEach(function (current) {
            sum = sum + parseFloat(current.value);
        });
        
        data.totals[type] = sum;
    }
    
    var calculateBudget = function () {
        // calculate total income and expenses        
        calculateTotal('exp');
        calculateTotal('inc');
        
        // calculate the budget: income - expenses
        data.budget = data.totals.inc - data.totals.exp;
        
        //calculate the percentage of income that we spent
        if (data.totals.inc > 0){
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
        } else {
            data.percentage = -1;
        }
    }
    
    var calculatePercentages = function () {
        data.allItems.exp.forEach( function (current){
            current.calculatePercentage(data.totals.inc);
        });
    };
    
    var getPercentages = function () {
        return data.allItems.exp.map(function (current) {
            return current.getPercentage();
        });
    };
    
    var getBudget = function () {
        return  {
            budget: data.budget,
            percentage: data.percentage === -1 ? '---' : data.percentage + '%',
            totalInc: data.totals.inc,
            totalExp: data.totals.exp
        };
    }
    
    var test = function () {
        return data;
    };
    
    return {
        addItem: addItem,
        test: test,
        calculateBudget: calculateBudget,
        getBudget: getBudget,
        deleteItem: deleteItem,
        getPercentages: getPercentages,
        calculatePercentages: calculatePercentages
    };
})();

var uiController = (function() {
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        incomePercentage: '.budget__income--percentage',
        expensesPercentageLabel: '.budget__expenses--percentage',
        container: '.container',
        itemExpensePercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var getInput = function(){
        
        //inc or exp
        var type = document.querySelector(DOMStrings.inputType).value;
        var description = document.querySelector(DOMStrings.inputDescription).value;
        var value = document.querySelector(DOMStrings.inputValue).value;
        
        return {
            type: type,
            description: description,
            value: value
        };
    };
    
    var addListItem = function (obj, type) {
        var html, newHtml, element;
        // Create HTML string with placeholder text
        
        if (type === 'exp') {
            element = DOMStrings.expensesContainer;
            html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
        } else if (type === 'inc') {
            element = DOMStrings.incomeContainer;
            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
        }
        
        // Replace the placeholder text with some actual data
        newHtml = html.replace('%id%', obj.id);
        newHtml = newHtml.replace('%description%', obj.description);
        newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
        
        // Insert the HTML into the DOM.
        document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    };
    
    var deleteListItem = function (id) {
        var element = document.getElementById(id);
        element.parentNode.removeChild(element);
    }
    
    var clearFields = function () {
        var fields, fieldsArray;
        fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
        
        fieldsArray = Array.prototype.slice.call(fields);
        
        fieldsArray.forEach(function (field, index, fields) {
            field.value = '';
        });
        
        fieldsArray[0].focus();
    };
    
    var displayBudget = function (obj) {
        var type;
        
        type = obj.budget > 0 ? 'inc' : 'exp';
        
        document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
        document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
        document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
        document.querySelector(DOMStrings.expensesPercentageLabel).textContent = obj.percentage;
    }
    
    var displayPercentages = function (percentages) {
        var items = document.querySelectorAll(DOMStrings.itemExpensePercentageLabel);
        
        var itemOperation = function (list, callback) {
            for (var i = 0; i < list.length; i++) {
                callback(list[i], i);
            }
        };
        
        var updatePercentage = function (current, index) {
            if (percentages[index] >= 0){
                current.textContent = percentages[index] + '%'
            } else {
                current.textContent = '---';
            }
        };
        
        itemOperation(items, updatePercentage);
    }
    
    var formatNumber = function (num, type) {
        var int, dec, length, result = '';
        
        num = Math.abs(num);
        num = num.toFixed(2);
        
        num = num.split('.');
        
        int = num[0];
        dec = num[1];
        
        //input = 25123456 - output = 25,123,456 and so on.
        int = putCommaToInt('', int);
        
        return (type === 'inc' ? '+' : '-') + ' ' + int + '.' + dec;
    };
    
    var putCommaToInt = function (result, rest) {
        var limit;
        if (rest.length <= 3) {
            return result + rest;
        }
        limit = rest.length%3 === 0 ? 3 : rest.length%3;
        result += rest.substr(0, limit) + ',';
        rest = rest.substr(limit, rest.length - limit);
        
        return putCommaToInt(result, rest);
    };
    
    var displayCurrentDate = function () {
        var date, month, year, dateElem, months;
        
        date = new Date();
        month = date.getMonth();
        year = date.getFullYear();
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        dateElem = document.querySelector(DOMStrings.dateLabel);
        dateElem.textContent = months[month] + ' ' + year;
    }
    
    return {
        getInput: getInput,
        getDOMStrings: function () {
            return DOMStrings;
        },
        addListItem: addListItem,
        clearFields: clearFields,
        displayBudget: displayBudget,
        deleteListItem: deleteListItem,
        displayPercentages: displayPercentages,
        displayCurrentDate: displayCurrentDate
    };
})();

var controller = (function(budgetCtrl, uiCtrl) {
    
    var setupEventListeners = function () {
        var DOM = uiCtrl.getDOMStrings();
        
        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(e) {
            if(e.keyCode === 13   || e.which === 13) {
                ctrlAddItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };
    
    var updateBudget = function () {
        var budget;
        
        // 1.- Calculate Budget
        budgetCtrl.calculateBudget();
        
        // 2.- Return the budget
        budget = budgetCtrl.getBudget();
        
        // 3.- Display the budget
        uiCtrl.displayBudget(budget);
    }
    
    var updatePercentages = function () {
        var percentages;
        
        // 1.- Calculate Percentages
        budgetCtrl.calculatePercentages();
        
        // 2.- Return the percentages
        percentages = budgetCtrl.getPercentages();
        
        // 3.- Display the percentages in the UI
        uiCtrl.displayPercentages(percentages);
    }
    
    var ctrlAddItem = function () {
        var input, newItem;
        
        // 1. Get the field input data
        input = uiCtrl.getInput();
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
             // 2. Add new item to budget.
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add new item to the budget list and display it.
            uiCtrl.addListItem(newItem, input.type);

            //4. Clear fields
            uiCtrl.clearFields();

            // 5. Calculate budget
            updateBudget();
            
            // 6. Update percentages
            updatePercentages();
        }
    };
    
    var ctrlDeleteItem = function (event) {
        var itemId, splitId, type, ID;
        
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemId) {
            splitId = itemId.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);
            
            //1.- Delete the item from the data structure.
            budgetCtrl.deleteItem(type, ID);
            
            //2.- Delete the item from the UI.
            uiCtrl.deleteListItem(itemId);
            
            //3.- Update and show the new budget.
            updateBudget();
            
            // 4.- Update percentages.
            updatePercentages();
        }
    };
    
    var init = function () {
        uiCtrl.displayCurrentDate();
        uiCtrl.displayBudget({
            budget: 0,
            percentage: '---',
            totalInc: 0,
            totalExp: 0
        });
        setupEventListeners();
    };
    
    return {
        init: init
    };
    
})(budgetController, uiController);

controller.init();