/* BUDGET CONTROLLER */

var budgetController = (function(){
    
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcpercentage = function(totalincome){
        
        if(data.totals.inc > 0){
            this.percentage =  Math.round((this.value/totalincome) * 100);
        }
        else {
            this.percentage = -1;
        }
        
    };
    
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };
    
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var data = {
        allItems :{
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget : 0,
        percentage : -1
    };
    
    var calculateTotal = function(type){
        
        var sum = 0;
        data.allItems[type].forEach(function(cur){
           sum += cur.value; 
        });
        
        data.totals[type] = sum;
        
        
    };
    
     
    
    return {
        addItem: function(type, description, value){
            
            var newItem, ID;
            
            if(data.allItems[type].length >0){
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            }
            else {
                ID = 0;
            }
            
            //create a new object
            if(type==='exp'){
                newItem = new Expense(ID,description,value);
            }
            else if(type==='inc'){
                 newItem = new Income(ID,description,value);
            }
            
            //add the object to the array
            
            data.allItems[type].push(newItem);
            
            //return the newitem
            
            return newItem;
        },
        
        calculateBudget : function(){
            
            //calculate total inc and exp
            calculateTotal('inc');
            calculateTotal('exp');
            
            //calculate budget
            data.budget = data.totals.inc - data.totals.exp;
            
            //calculate perc of exp in our inc
            
            if(data.totals.inc > 0){
            data.percentage = Math.round( (data.totals.exp / data.totals.inc) *100);}
            else {
                data.percentage = -1; 
            }
        },
        
        calculatePercentages : function(){
            
            data.allItems.exp.forEach(function(cur){
                cur.calcpercentage(data.totals.inc);
            });
            
        },
        
        getPercentages : function(){
            
            var allPerc = data.allItems.exp.map(function(cur){  
                return cur.getPercentage();
            });
            return allPerc;
            
        },
        
        getBudget : function(){
            
            return {
                budget : data.budget,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp,
                percentage : data.percentage
                
            };
            
        },
        
        deleteItem : function(type,id){
          
            var ids, index;
            
            ids = data.allItems[type].map(function(current) {
               return current.id; 
            });
            
            index = ids.indexOf(id);
            
            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
            
        },
        
        
        testing : function(){
            console.log(data);
        }
    };
    
    
})();


/* UI CONTROLLER */

var UIController = (function(){
    
    var DOMStrings = {
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputBtn : '.add__btn',
        budgetLabel : '.budget__value',
        incomeLabel : '.budget__income--value',
        expensesLabel : '.budget__expenses--value',
        percentageLabel : '.budget__expenses--percentage',
        container : '.container'
    };
    
    var formatNumber = function(num, type){
            
            var numSplit, int, dec, type;
            
            num = Math.abs(num);
            num = num.toFixed(2);
            
            numSplit = num.split('.');
            
            int = numSplit[0];
            if(int.length > 3){
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3,3);
            }
            
            dec = numSplit[1];
            
            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
        };
    
    
    
    return {
        getInput : function(){
            return {
                type : document.querySelector(DOMStrings.inputType).value,
                description : document.querySelector(DOMStrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },
        
        
        
        getDOMstrings : function(){
        return DOMStrings;
        },
        
        addListItem: function(obj, type){
            
            var html, element;
            
            //create html strings
            if(type==='inc'){
                element = '.income__list';
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'; 
            }
            else if(type==='exp'){
                element = '.expenses__list';
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            //replace as newHtml
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value, type));
             
            
            //add to DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
            
        },
        
        deleteListItem : function(selectorID){
            
            var el;
            el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
        },
        
        clearFields : function(){
            
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMStrings.inputValue + ', ' + DOMStrings.inputDescription);
            
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array){
               
                current.value = "";
                
            });
            
            fieldsArr[0].focus();
            
        },
        
        displayPercentages : function(percentages){
            
            var fields = document.querySelectorAll('.item__percentage');
            
            var nodeListForEach = function(nodeList, callback){
                for(var i=0;i<nodeList.length;i++){
                    callback(nodeList[i],i);
                }
            };
            
            nodeListForEach(fields, function(cur, index){
                
                if(percentages[index] > 0){
                    cur.textContent = percentages[index] + '%';
                }
                else{
                    cur.textContent = '---';
                }
                
            });
            
        },
        
        displayMonth : function(){
            
            var now,month,months,year;
            
            now = new Date();
            
            month = now.getMonth();
            
            months = ['January','February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            year = now.getFullYear();
            
            document.querySelector('.budget__title--month').textContent = months[month] + ' ' + year;
            
        },
        
        displayBudget : function(obj){
            
            var type;
            if(obj.budget >= 0){
                type = 'inc';
            }
            else{
                type = 'exp';
            }
            
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');
           
            
           if(obj.percentage > 0){ document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';}
            else{
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
             
        }
        
       
        
    };
    
    
})();


/*  CONTROLLER */

var controller = (function(budgetCtrl,UICtrl){
    
    var updateBudget = function(){
        
        //update budget controller
        budgetCtrl.calculateBudget();
        
        //get the budget
        var budget = budgetCtrl.getBudget();
        
        //update UI
        UICtrl.displayBudget(budget);
    };
    
    var ctrlAddItem = function(){
        
        //getting input data
        var input = UICtrl.getInput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
        
        //adding the data to the budget controller
        var newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        
        //adding object to the UI
         UICtrl.addListItem(newItem, input.type);
        
        //clear input fields
        UICtrl.clearFields();
        
        //update and display the budget
        updateBudget();
            
        //update percentages
        updatePercentages();
        
        }
    };  
    
    var updatePercentages = function(){
      
        //calculate percentages
        budgetCtrl.calculatePercentages();
        
        //get the percentages
        var percentages = budgetCtrl.getPercentages();
        
        //update the ui
        UICtrl.displayPercentages(percentages);
        
        
        
    };
    
    var ctrlDeleteItem = function(event){
        
        var itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID){
            
            var splitID = itemID.split('-');
            var type = splitID[0];
            var ID = parseInt(splitID[1]);
            
        // delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            
        // delete item from the UI
            UICtrl.deleteListItem(itemID);
            
        //update the budget
            updateBudget(); 
            
        //update the percentages
            updatePercentages();
        }
        
        
    };
    
    var setupEventListeners = function(){
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
    document.addEventListener('keypress',function(event) {
        
        if(event.which===13){
        ctrlAddItem();
        }
         
    });
        
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        
    }
    
    return {
        init : function(){
            console.log('started');
            UICtrl.displayBudget({
                budget : 0,
                totalInc : 0,
                totalExp : 0,
                percentage : -1
                        });
            UICtrl.displayMonth();
            
            setupEventListeners();
        }
    }
    
    
    
    
})(budgetController,UIController);


controller.init();