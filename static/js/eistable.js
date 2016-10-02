function EISTable (id, defaultsort, headerNames)
{
    this.defaultsort = defaultsort;
    this.displayTable = displayTable;  
    // Builds the HTML Table out of myList json data from Ivy restful service.
    var tableSort = [];
    var sortColumn = this.defaultsort;
    var sortDirection = 'desc';
    this.sortDirection = 'desc';
    var headerNames =  headerNames;
    var id = id;
    this.data = null;
    var arrHide = [];
    
    function ContainsString(a, obj) {
        if (a == null)
          return true;

        for (var i = 0; i < a.length; i++) {
            if (String(a[i]).toLowerCase() == String(obj).toLowerCase()) {
                return true;
            }
        }
        return false;
    }

    
    function buildHtmlTable(id, myList, headerNames) {
        console.log("buildHtmlTable called");
        var columns = addAllColumnHeaders(id, myList);
        for (var i = 0 ; i < myList.length ; i++) {
            var row = $('<tr id="' + myList[i]['id'] + '"/>');
            for (var colIndex = 0 ; colIndex < columns.length ; colIndex++) {
                var cellValue = myList[i][columns[colIndex]];
                if (cellValue == null) { 
                    cellValue = ""; 
                }
                var style = getStyle(columns[colIndex]);
                row.append($('<td ' + style + '/>').html(cellValue));
            }
            $("#" + id).append(row);
        }
    }
    this.SetColumnsHidden = function (_arrHide)
    {
      arrHide = _arrHide;
    }

    function getStyle (key)
    {
      if (key.indexOf("__") != -1 || ContainsString(arrHide,key))
        return 'style="display:none;"';
      return "";
    }
    function addAllColumnHeaders(id, myList)
    {
        console.log(sortColumn);
        var columnSet = [];
        var headerTr = $('<tr/>');
        for (var i = 0 ; i < myList.length ; i++) {
          var rowHash = myList[i];
          for (var key in rowHash)
          {
            if (!ContainsString(columnSet,key))
            {
              columnSet.push(key);
              var span = '';
              
              console.log(key + '-' + sortColumn);
              

              if (key == sortColumn)
              {
                console.log(key);
                console.log(sortColumn);
                var direction = 's';
                if (sortDirection == 'asc')
                {
                  direction = 'n';
                }
                span = '<span style="float:right;" class="ui-icon ui-icon-triangle-1-' + direction + '"></span>';
              } else 
              {
                span = '<span style="float:right;" class="ui-icon ui-icon-triangle-2-n-s"></span>' //.ui-icon-triangle-2-n-s
              }
              var displayName = key;
              if (headerNames != undefined)
              {
                if (headerNames[key] != undefined)
                {
                  displayName = headerNames[key];
                }
              }
              var style = getStyle(key);
              headerTr.append($('<th ' + style + ' data-direction="' + sortDirection + '" nowrap class="header ' + id + '" data-toggle="' + key + '"/>').html(displayName + span));
            }
          }
        }

        $("#" + id).append($('<thead/>').html(headerTr));
        return columnSet;
    }

    function displayTable (id, org, table, sortby, sortdirection, action, _headerNames)
    {
      $("#" + id).empty();
      sortColumn = sortby;
      sortDirection = sortdirection;
      if (headerNames != undefined)
      {
        headerNames = $.extend([], _headerNames)
      }
      var url = '/' + org + '/' + table + '/' + sortby + '/' + sortdirection + '/' + action;
      console.log(url);
      $.ajax({
            url: url,
            type: 'get',
            dataType: 'json',
            success: function(json) {
                if (json['success']) {
                  this.data = json['data'];
                  buildHtmlTable(id, json['data'], headerNames);
                    $('.header.' + id).click(function() {
                      var newSortDirection = $(this).attr("data-direction");
                      if (sortdirection == 'asc')
                      {
                        newSortDirection = 'desc';
                      } else {
                        newSortDirection = 'asc';
                      }
                      var newSortBy = $(this).attr("data-toggle");

                      displayTable (id, org, table, newSortBy, newSortDirection, action, headerNames);
                    });

                    tableready(id);
                }                 
            }
        });
    }
}

function FocusElement (id)
{
  $('#' + id).focus();
}

function updateElement(id, val)
{
  var element = document.getElementById(id);
  if (element != null)
  {
    element.value = val;
  }
}

