var budgetController = (function () {
  var Expense = function (id, value, description) {
    this.id = id;
    this.value = value;
    this.description = description;
    this.percentage = -1;
  };

  Expense.prototype.calcuPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  var Income = function (id, value, description) {
    this.id = id;
    this.value = value;
    this.description = description;
  };

  var calculateTotal = function (type) {
    var sum = 0;
    data.allItem[type].forEach(function (cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItem: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  return {
    addItem: function (type, desc, val) {
      var newItem, ID; //newItem should be object
      // Create an ID
      if (data.allItem[type].length > 0) {
        ID = data.allItem[type][data.allItem[type].length - 1].id + 1;
      } else {
        ID = 0;
      }
      //   Choose the "exp" or "inc"
      if (type === "exp") {
        newItem = new Expense(ID, val, desc);
      } else if (type === "inc") {
        newItem = new Income(ID, val, desc);
      }
      //   push the new item to the data object
      data.allItem[type].push(newItem);
      // return the newItem object
      return newItem;
    },
    // calculate the budget
    calculateBudget: function (type) {
      //   calculate income and expenses
      calculateTotal("exp");
      calculateTotal("inc");
      //  calculate budget income - expenses
      data.budget = data.totals.inc - data.totals.exp;
      //   calculate the percentage
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      }
      if (data.totals.inc > 0) {
        data.totals.expPercentage = Math.round(
          (data.totals.inc / data.allItem["exp"].value) * 100
        );
      }
    },
    calculatePercentage: function () {
      data.allItem.exp.forEach(function (cur) {
        cur.calcuPercentage(data.totals.inc);
      });
    },

    getPercentages: function () {
      var allPerc = data.allItem.exp.map(function (cur) {
        return cur.getPercentage();
      });
      return allPerc;
    },

    getBudget: function () {
      return {
        budget: data.budget,
        income: data.totals.inc,
        expenses: data.totals.exp,
        percentage: data.percentage,
      };
    },

    deleteItem: function (type, id) {
      var ids = data.allItem[type].map(function (current) {
        return current.id;
      });

      var index = ids.indexOf(id);
      if (index !== -1) {
        data.allItem[type].splice(index, 1);
      }
    },

    testing: function () {
      console.log(data);
    },
  };
})();

var UIController = (function () {
  var DOMStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    container: ".container",
  };
  var formateNumber = function (num, type) {
    var numSplit, type, int, dec;
    /**
     put + and - sign according to type
      exactly 2 decimal
      comma saperating the thousands

      2356.456 -> 2,356.46
      200 -> 200.00
     */
    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split(".");
    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    }
    dec = numSplit[1];

    return (type === "exp" ? "-" : "+") + int + "." + dec;
  };
  var nodeListForEach = function (list, callback) {
    for (i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };
  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMStrings.inputType).value, //Will be inc or exp
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
      };
    },

    addItemList: function (obj, type) {
      var html, newHtml, element;
      if (type === "exp") {
        element = DOMStrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "inc") {
        element = DOMStrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formateNumber(obj.value, type));

      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },
    deleteListItem: function (selectorId) {
      var el = document.getElementById(selectorId);
      el.parentNode.removeChild(el);
    },

    clearField: function () {
      var fields, arrFields;
      fields = document.querySelectorAll(
        DOMStrings.inputDescription + ", " + DOMStrings.inputValue
      );
      arrFields = Array.prototype.slice.call(fields);
      arrFields.forEach(function (current) {
        current.value = "";
      });
      arrFields[0].focus();
    },
    displayBudget: function (obj) {
      var type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");
      document.querySelector(".budget__value").textContent = formateNumber(
        obj.budget,
        type
      );
      document.querySelector(
        ".budget__income--value"
      ).textContent = formateNumber(obj.income, "inc");
      document.querySelector(
        ".budget__expenses--value"
      ).textContent = formateNumber(obj.expenses, "exp");
      if (obj.percentage > 0) {
        document.querySelector(".budget__expenses--percentage").textContent =
          obj.percentage + " %";
      } else {
        document.querySelector(".budget__expenses--percentage").textContent =
          "---";
      }
    },
    displayPercentages: function (percentages) {
      var fields = document.querySelectorAll(".item__percentage");

      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + " %";
        } else {
          current.textContent = "---";
        }
      });
    },
    getMonth: function () {
      var now, month, months, year;
      now = new Date();
      months = [
        "January",
        "Fabruary",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(".budget__title--month").textContent =
        months[month] + " " + year;
    },
    changeType: function () {
      var fields = document.querySelectorAll(
        DOMStrings.inputType +
          "," +
          DOMStrings.inputValue +
          "," +
          DOMStrings.inputDescription
      );
      nodeListForEach(fields, function (cur) {
        cur.classList.toggle("red-focus");
      });
      document.querySelector(DOMStrings.inputBtn).classList.toggle("red");
    },

    getDOMString: function () {
      return DOMStrings;
    },
  };
})();

var conroller = (function (bgtCtrl, UICtrl) {
  var setUpEventListner = function () {
    var DOM = UICtrl.getDOMString();

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
    document.addEventListener("keypress", function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);
    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changeType);
  };

  var updateBudget = function () {
    // 1. Calculate the budget
    bgtCtrl.calculateBudget();
    // 2. return the budget
    var budget = bgtCtrl.getBudget();
    // 3. Display budget on the UI
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function () {
    // 1. calculate the percentages
    bgtCtrl.calculatePercentage();
    // 2. get the percentages from the budget controller
    var percentages = bgtCtrl.getPercentages();
    // 3. disply the percentages
    UICtrl.displayPercentages(percentages);
  };

  var ctrlAddItem = function () {
    var input, addItem;
    // 1. Get the field input data
    input = UICtrl.getInput();
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item into the budgetController
      addItem = bgtCtrl.addItem(input.type, input.description, input.value);
      // 3. Add the item to the UI
      UICtrl.addItemList(addItem, input.type);
      // 4. Clear the fields
      UICtrl.clearField();
      // 5. Update budget
      updateBudget();
      // 6. update the percentages
      updatePercentages();
    }
  };

  var ctrlDeleteItem = function (event) {
    var itemId, splitId, type, id;

    itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemId) {
      splitId = itemId.split("-");
      type = splitId[0];
      id = parseInt(splitId[1]);

      // 1. delete the item from the datastructure
      bgtCtrl.deleteItem(type, id);
      // 2. delete from the UI
      UICtrl.deleteListItem(itemId);
      // 3. Update the budget
      updateBudget();
      // 4. update the percentages
      updatePercentages();
    }
  };

  return {
    init: function () {
      console.log("Application Has statrted");
      UICtrl.getMonth();
      UICtrl.displayBudget({
        budget: 0,
        income: 0,
        expenses: 0,
        percentage: -1,
      });
      setUpEventListner();
    },
  };
})(budgetController, UIController);

conroller.init();
