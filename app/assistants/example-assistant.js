function ExampleAssistant () { }

ExampleAssistant.prototype = {

  swipeMenu: {
    menu: null,
    element: null,
    show: false
  },

  setup: function () {
    this.controller.setupWidget("listId",
      this.attributes = {
        itemTemplate: "example/list",
        swipeToDelete: false,
        reorderable: true
      },
      this.model = {
        listTitle: "List Title",
        items : [
          {data: "Item 1"},
          {data: "Item 2"},
          {data: "Item 3"},
          {data: "Item 4"},
          {data: "Item 5"},
          {data: "Item 6"},
       ]
     }
    ); 

    this.dragStartHandler = this.dragStart.bind(this);
    Mojo.Event.listen(this.controller.get('listId'), Mojo.Event.dragStart, this.dragStartHandler);
  },

  dragStart: function (event) {

    if (this.swipeMenu.menu) {
      this.removeSwipeMenu();
    }
     
    if (Math.abs(event.filteredDistance.x) > Math.abs(event.filteredDistance.y) * 2) {
      var node = event.target.up(".palm-row");
      Mojo.Drag.setupDropContainer(node, this);

      node._dragObj = Mojo.Drag.startDragging(this.controller, node, event.down, {
        preventVertical: true,
        draggingClass: "palm-delete-element",
        preventDropReset: false
      });

      event.stop();             
    }         
  },          
          
  dragEnter: function (element) {
    this.swipeMenu.menu = document.createElement('div');
    this.swipeMenu.menu.className = 'palm-row palm-swipe-delete swipe-menu';

    element.insert({ before: this.swipeMenu.menu });

    this.swipeMenu.menu.update(Mojo.View.render({ template: 'example/custom-menu' }));

    element.style.height = this.swipeMenu.menu.offsetHeight + 'px';
  },

  dragHover: function (element) {
    if (element.offsetLeft > 200 || element.offsetLeft < -200) {
      this.swipeMenu.show = true;
    } else {   
      this.swipeMenu.show = false;
    }          
  },           

  dragDrop: function (element) {
    if (this.swipeMenu.show === true) {
      this.swipeMenu.element = element;
      this.swipeMenu.element.hide();

      this.controller.listen("swipeAlert", Mojo.Event.tap, this.alertHandler = (function () {
        this.controller.showAlertDialog({
          onChoose: function (value) {
            this.controller.get('swipeAlert').innerHTML = value;
          },
          title: $L("Filet Mignon"),
          message: $L("How would you like your steak done?"),
          choices:[
            { label:$L('Rare'), value:"rare", type:'affirmative' },  
            { label:$L("Medium"), value:"med" },
            { label:$L("Overcooked"), value:"well", type:'negative' },    
            { label:$L("Nevermind"), value:"cancel", type:'dismiss' }    
          ]
        }); 
      }).bind(this));

      this.controller.listen("swipeCancel", Mojo.Event.tap, this.cancelHandler = this.removeSwipeMenu.bind(this));

    } else {
      this.swipeMenu.element = null;
      this.swipeMenu.menu.remove();
      this.swipeMenu.menu = null;
    }

    this.swipeMenu.show = false;
  },

  removeSwipeMenu: function () {
    this.swipeMenu.menu.remove();
    this.swipeMenu.menu = null;
    this.swipeMenu.element.show();
    this.swipeMenu.element = null;

    this.controller.stopListening("swipeCancel", Mojo.Event.tap, this.cancelHandler);
    this.controller.stopListening("swipeAlert", Mojo.Event.tap, this.alertHandler);
  }

};
