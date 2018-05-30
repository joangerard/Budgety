var budgetController = (function () {
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        }
    };
    
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
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
    
    var test = function () {
        return data;
    };
    
    return {
        addItem: addItem,
        test: test
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
            html = '<div class="item clearfix" id="expense-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
        } else if (type === 'inc') {
            element = DOMStrings.incomeContainer;
            html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
        }
        
        // Replace the placeholder text with some actual data
        newHtml = html.replace('%id%', obj.id);
        newHtml = newHtml.replace('%description%', obj.description);
        newHtml = newHtml.replace('%value%', obj.value);
        
        // Insert the HTML into the DOM.
        document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    };
    
    var clearFields = function () {
        var fields, fieldsArray;
        fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
        
        fieldsArray = Array.prototype.slice.call(fields);
        
        fieldsArray.forEach(function (field, index, fields) {
            field.value = '';
        });
        
        fieldsArray[0].focus();
    };
    
    return {
        getInput: getInput,
        getDOMStrings: function () {
            return DOMStrings;
        },
        addListItem: addListItem,
        clearFields: clearFields
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
    };
    
    var ctrlAddItem = function () {
        var input, newItem;
        
        // 1. Get the field input data
        input = uiCtrl.getInput();
        
        // 2. Add new item to budget.
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        
        // 3. Add new item to the budget list and display it.
        uiCtrl.addListItem(newItem, input.type);
        
        //4. Clear fields
        uiCtrl.clearFields();
    };
    
    var init = function () {
        setupEventListeners();
    };
    
    return {
        init: init
    };
    
})(budgetController, uiController);

controller.init();