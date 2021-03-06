$(function() {

  /********************/
  /* Define constants */
  /********************/

  // Menu items for cloning
  var menuItems = {
    logical: '<select name="logical" class="ui-selectmenu-menu ui-widget ui-corner-all"><option value="AND">AND</option><option value="OR">OR</option></select>',
    bracket: '<select name="bracket" id="bracket-clone" class="ui-selectmenu-menu ui-widget ui-corner-all"><option value="(">(</option><option value=")">)</option></select>',
    comparison: '<select name="comparison" class="ui-selectmenu-menu ui-widget ui-corner-all"><option value="==">==</option><option value="!=">!=</option><option value="<">&lt;</option><option value=">">&gt;</option><option value="<=">&lt;=</option><option value=">=">&gt;=</option></select>'
  }

  // Answer types
  var answers = [
    { type:'select', value:'<select name="boolean" class="answer ui-selectmenu-menu ui-widget ui-corner-all"><option value="yes">Yes</option><option value="no">No</option></select>' },
    { type:'select', value:'<select name="range-abc" class="answer ui-selectmenu-menu ui-widget ui-corner-all"><option value="na">N/A</option><option value="pass">Pass</option></select>' },
    { type:'select', value:'<select name="range-numeric" class="answer ui-selectmenu-menu ui-widget ui-corner-all"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select>' },
    { type:'input', value:'<input class="answer ui-widget ui-widget-content ui-corner-all" placeholder="Enter..." />' }
  ];

  /*******************/
  /* Component class */
  /*******************/

  // Component class contructor
  function Component(type) {
    this.type = type;
    this.menu = $('select#' + type);
    this.button = $('button#add-' + type);
    this.elementWidth = 125;
  };

  // Initialise select menus
  Component.prototype.initSelectMenu = function() {
    var component = this;
    this.menu.selectmenu({
      width: component.elementWidth,
      change: function(e, ui) {
        component.button.attr('disabled', !ui.item.index);
        if (component.type == 'question') {
          $('button#add-answer').attr('disabled', true);
          var selectedIndex = $('option:selected', this).index();
          component.createAnswerElement(selectedIndex, 65);
        }
      }
    });
  }

  // Create Answer element in dependence upon Question menu selection
  Component.prototype.createAnswerElement = function(selectedIndex) {
    var component = this;
    var answerContainer = $('span#answer-container');
    answerContainer.empty();
    if (!selectedIndex) return false;
    var answer = answers[selectedIndex-1];
    if (answer.type == 'select') {
      var answerMenu = $(answer.value);
      answerMenu.prepend('<option value="">- answers -</option>'); 
      answerMenu.clone().appendTo(answerContainer).selectmenu({ 
        width: component.elementWidth,
        change: function(e, ui) {
          var value = ui.item.value;
          var index = ui.item.index;
          $('button#add-answer').attr('disabled', !ui.item.index);
        },
      }).selectmenu("refresh");
    } else {
      var inputAnswer = $(answer.value).clone().appendTo(answerContainer);
      inputAnswer.focus();
      inputAnswer.unbind('keyup').keyup(function(e) {
        $('button#add-answer').attr('disabled', !e.target.value.trim());
      });
    }
  }

  // Event handler for adding a comparison, bracket or logical item
  Component.prototype.addItemEventHandler = function(width) {
    var component = this;
    this.button.unbind('click').click(function(e) {
      var val = component.menu.val();
      var item = component.createSortableItem(val);
      item.appendTo($('.sortable'));
      var itemContent = item.find('.item-content');
      $(menuItems[component.type]).clone().appendTo($(itemContent)).selectmenu({
        width: width,
        create: function(event, ui) {
          $(this).val(val);
          $(this).selectmenu('refresh');
        },
        change: function(event, ui) {
          component.updateDataItem(this, component.type, ui.item.value);
        }
      });
      component.removeItemEventHandler();
    });
  }

  // Event handler for adding a Question item
  Component.prototype.addQuestionItemEventHandler = function() {
    var component = this;
    this.button.unbind('click').click(function(){
      var selectedText = component.menu.val();
      if (!selectedText) return;
      var item = component.createSortableItem(selectedText);
      var itemContent = item.find('.item-content');
      itemContent.html('<span class="item">' + selectedText + '</span>');
      item.appendTo($('.sortable'));
      component.removeItemEventHandler();
    });
  }
  
  // Event handler for adding an Answer item
  Component.prototype.addAnswerItemEventHandler = function(width) {
    var component = this;
    $('#add-answer').unbind('click').click(function(){
      var val = $('span#answer-container > .answer').val();
      var item = component.createSortableItem(val);
      item.appendTo($('.sortable'));
      var itemContent = item.find('.item-content');
      var selectedIndex = $('#question option:selected').index();
      var answer = answers[selectedIndex-1];
      if (answer.type == 'select') {
        $(answer.value).clone().appendTo($(itemContent)).selectmenu({ 
          width: width,
          change: function(event, ui) {
            component.updateDataItem(this, 'answer', ui.item.value);
          },
          create: function(event, ui) {
            $(this).val(val);
            $(this).selectmenu('refresh');
          }
        });
      } else {
        $(answer.value).clone().appendTo($(itemContent));
        var inputField = itemContent.find('.answer');
        inputField.val(val);
        inputField.unbind('keyup').keyup(function(e){
          component.updateDataItem(this, 'answer', e.target.value.trim());
        });
      }
      component.removeItemEventHandler();
    });
  }

  Component.prototype.updateDataItem = function(context, type, value) {
    $(context).parent().parent().attr('data-item', type + ':' + value);
    updateSortableData('.sortable');
  }

  // Create an item for sortable area
  Component.prototype.createSortableItem = function(val) {
    var cleanedValue = val.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return $("<li data-item=" + this.type + ':' + cleanedValue + "><span class='draggable'></span><span class='item-content'></span><span class='remove'></span></li>");
  }

  // Event handler for removing an item from the sortable area
  Component.prototype.removeItemEventHandler = function() {
    $(".sortable .remove").unbind('click').click(function(e){
      $(this).parent().remove();
      updateSortableData(".sortable");
    });
    $(".sortable").sortable("refresh");
    updateSortableData(".sortable");
  }

  /**************************/
  /* Instantiate components */
  /**************************/

  var questionComponent = new Component('question');
  questionComponent.initSelectMenu();
  questionComponent.addQuestionItemEventHandler();

  var answerComponent = new Component('answer');
  answerComponent.addAnswerItemEventHandler(65);

  var logicalComponent = new Component('logical');
  logicalComponent.initSelectMenu();
  logicalComponent.addItemEventHandler(65);

  var bracketComponent = new Component('bracket');
  bracketComponent.initSelectMenu();
  bracketComponent.addItemEventHandler(40);

  var comparisonComponent = new Component('comparison');
  comparisonComponent.initSelectMenu();
  comparisonComponent.addItemEventHandler(50);

  /*********************/
  /* Generic functions */
  /*********************/

  // Define sortable list
  $(".sortable").sortable({
    items: "> li",
    handle: ".draggable",
    tolerance: "pointer",
    placeholder: "ui-sortable-placeholder",
    forcePlaceholderSize: true,
    start: function(e, ui){
      var itemHeight = ui.item.height();
      ui.placeholder.height(itemHeight);
    },
    sort: function(e, ui){ ui.item.addClass("selected"); },
    stop: function(e, ui){ ui.item.removeClass("selected"); },
    update: function(e, ui) { updateSortableData(this); }
  });

  // Update data for sending to backend
  function updateSortableData(elem) {
    var group = $(elem).sortable("toArray", { attribute: "data-item" });
    var json = group.map(function(item, index){
      var pair = item.split(':');
      return { component:pair[0], value:pair[1], sortOrder:index+1 };
    });
    var data = JSON.stringify(json, null, 2);
    $('#data').text(data);
    var rules = json.map(function(item){ return item.value; });
    $('#rules').text(rules.join(" "));
  }

  updateSortableData('.sortable');

  // Event handler for reset button
  $('#reset').unbind('click').click(function(){
    $(".sortable > li").each(function() { $(this).remove(); });
    updateSortableData(".sortable");
  });

});