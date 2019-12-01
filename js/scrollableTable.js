
var scrollableTable = function(id) {

    var root = this
    var _id = id
    var removeHeightByPx = 120
    var lastSelectedRow = ""
    var lastRowId = -1
    var isTreeTable = false

    var create = function() {
        $('<section>').addClass("scrollableTableSection").append(
            $('<div>').addClass("scrollableTableContainer").append(
                $('<table>').attr('id', id).addClass("scrollableTable").append(
                    $('<thead>').attr("id", "scrollableTableHeader"), $('<tbody>') )
        )).prependTo('#wrapper');

        // set listener to adjust height
        $( window ).resize(function() {
            $('.scrollableTableContainer').height( $( window ).height() - removeHeightByPx )
        })

        // adjust height
        $('.scrollableTableContainer').height( $( window ).height() - removeHeightByPx )

        $(document).keydown(function(e) { 
            if (e.key == "ArrowUp") selectPreviousRow()
            if (e.key == "ArrowDown") selectNextRow()
        })
    }

    var getNestedProperty = function(obj, propArray) {
        try {
            var _obj = obj
            propArray.forEach(prop => {
                _obj = _obj[prop]
            });
            return _obj
        } catch (e) {
            return "NO VALUE!"
        }
    }

    
    this.selectRow = function(rowId, triggerEventName, itemName) {
        if (lastSelectedRow != "") {
            $('#'+lastSelectedRow).children().removeClass("scrollableTableSelectedRow")
        }
        
        if (lastSelectedRow == rowId) {
            lastSelectedRow = ""

            $( document ).trigger( triggerEventName, [ "" ] )
        } else {
            $("#"+rowId).children().addClass("scrollableTableSelectedRow")
            lastSelectedRow = rowId

            $( document ).trigger( triggerEventName, [ itemName ] )
        }
    }

    this.selectTreeTableRow = function(rowId, triggerEventName, itemName) {
        if (lastSelectedRow != rowId) {
            if (lastSelectedRow != "") {
                $('#'+lastSelectedRow).children().removeClass("scrollableTableSelectedRow")
            }

            $("#"+rowId).children().addClass("scrollableTableSelectedRow")
            lastSelectedRow = rowId

            $( document ).trigger( triggerEventName, [ itemName ] )
        }
    }


    var selectPreviousRow = function() {
        if (lastSelectedRow != "" && !($('#'+lastSelectedRow).is(':first-child'))) {
            $('#'+lastSelectedRow).prev().click()
        }
    }

    var selectNextRow = function() {
        if (lastSelectedRow != "" && !($('#'+lastSelectedRow).is(':last-child'))) {
            $('#'+lastSelectedRow).next().click()
        }
    }

    this.setTableHeader = function(names) {
        // clear first
        $('#'+id+' > thead').empty()

        var trElem = $('<tr>');
        $.each(names, function(index, value) {
            // Set header
            trElem.append( 
                $('<th>').append($('<div>').text(value))
            )
        });
        trElem.appendTo("#scrollableTableHeader")
    }

    this.adjustHeaderSize = function() {
        // Adjust size
        $('#'+id+' > thead > tr').children('th').each(function () {
            $(this).children().first().width( $(this).width() )
        })
    }

    this.setTreeTableContent = function(data, eventType, columns, subtreePropertyName) {
        isTreeTable = true
        fillTable(data, eventType, columns, subtreePropertyName)

        root.adjustHeaderSize()
    }

    this.setTableContent = function(data, eventType, columns) {
        isTreeTable = false
        fillTable(data, eventType, columns)

        root.adjustHeaderSize()

        $('#scrollableTable').tablesorter(); 
    }

    var fillTable = function(data, eventType, columns, subtreePropertyName="") {
        $('#'+id+' > tbody').empty()
        lastSelectedRow = ""

        // Fill content
        $.each(data, function(index) {
            createRow(data, index, eventType, columns, subtreePropertyName)
        })
    }

    var createRow = function(data, index, eventType, columns, subtreePropertyName) {
        createChildRow(data, index, eventType, columns, subtreePropertyName, null,"",1);
    }

    var createChildRow = function(data, index, eventType, columns, subtreePropertyName, insertAfterElem, parentId, level) {
        const rowId = id+'_rowId_'+ (++lastRowId)

        var trElem = $('<tr>').attr('id', rowId).attr('level', level).attr('parentId', parentId)

        if (isTreeTable) trElem.click(() => { root.selectTreeTableRow(rowId, eventType, index) })
        else trElem.click(() => { root.selectRow(rowId, eventType, index) })

        const distText = level*16
        const distIcon=(level-1)*16

        $.each(columns, function(c_index, c_value) {
            trElem.append($('<td>').attr('parentId', parentId).text(data[index][c_value]))
        })

        // isTreeTable
        if (isTreeTable) {
            trElem.children().first().attr('style', 'padding-left: '+distText+'px; ')

            // if element has subtree
            if (data[index][subtreePropertyName] !== undefined && data[index][subtreePropertyName].length > 0 ) {
                const fristTdElem = trElem.children().first();
                
                fristTdElem.removeClass("scrollableTableExpanded")
                fristTdElem.addClass("scrollableTableCollapsed")
                fristTdElem.attr('style', 'padding-left: '+distText+'px; background-position-x: '+distIcon+'px; ')
                trElem.attr('status', 'closed')

                trElem.click(() => {
                    const subtreeData = data[index][subtreePropertyName]
                    // const _rowId = rowId
                    // const _level = level+1

                    if ($('#'+rowId).attr('status') == 'closed') {
                        $('#'+rowId).attr('status', 'open')
                        // Fill content
                        for (var i=subtreeData.length-1; i>=0; i--) {
                            createChildRow(subtreeData, i, eventType, columns, subtreePropertyName, trElem, rowId, level+1)
                        }
                        fristTdElem.addClass("scrollableTableExpanded")
                        fristTdElem.removeClass("scrollableTableCollapsed")

                    } else {
                        closeSubRows(rowId)
                    }

                    root.adjustHeaderSize() 
                })
            }
        }
        
        if (insertAfterElem == null) {
            trElem.appendTo('#'+id)
        } else {
            trElem.insertAfter(insertAfterElem)
        }
    }

    var closeSubRows = function(parentRowId) {
        $('#'+parentRowId).attr('status', 'closed')
        
        $( "td[parentId='"+parentRowId+"']" ).each(function(index, elem) {
            var parentTr = $( document ).find( elem ).parent()
            if (parentTr.attr('status') == 'open') closeSubRows(parentTr.attr('id'))
        })

        $( "td[parentId='"+parentRowId+"']" ).parent().remove()
    }

    this.clearTable = function() {
        lastSelectedRow = ""
        $('#scrollableTable > thead').empty()
        $('#scrollableTable > tbody').empty()
    }

    create()
}
