
var scrollableTable = function(id) {

    var root = this
    var _id = id
    var removeHeightByPx = 120
    var lastSelectedRow = ""

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

    this.setHeader = function(names) {
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

    this.setTableContent = function(data, eventType, columns) {
        $('#'+id+' > tbody').empty()
        lastSelectedRow = ""

        // Fill content
        var count = 0
        $.each(data, function(index) {
            const rowId = id+'_rowId_'+count
            var trElem = $('<tr>')
                .attr('id', rowId)
                .click(() => { root.selectRow(rowId, eventType, index) })
            
            $.each(columns, function(c_index, c_value) {
                trElem.append($('<td>').text(data[index][c_value]))
            })
            
            trElem.appendTo('#'+id)
            count++
        })

        root.adjustHeaderSize()

        $('#scrollableTable').tablesorter(); 
    }

    this.clearTable = function() {
        lastSelectedRow = ""
        $('#scrollableTable > thead').empty()
        $('#scrollableTable > tbody').empty()
    }

    create()
}
