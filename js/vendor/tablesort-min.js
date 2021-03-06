// Table Sorter v2.3; Apache 2; http://neil.fraser.name/software/tablesort/
var TableSort = {};
TableSort.enabled = true;
TableSort.arrowNone = ' &nbsp;';
TableSort.arrowUp = ' &uarr;';
TableSort.arrowDown = ' &darr;';
TableSort.titleText = 'Sort by this column';
TableSort.tables = [];
TableSort.lastSort = [];
TableSort.initAll = function () {
    if (!TableSort.enabled) {
        return
    }
    var a = document.getElementsByTagName('TABLE');
    for (var x = 0, table; table = a[x]; x++) {
        TableSort.initTable_(table)
    }
};
TableSort.init = function (a) {
    if (!TableSort.enabled) {
        return
    }
    for (var x = 0; x < arguments.length; x++) {
        var b = document.getElementById(arguments[x]);
        if (b) {
            TableSort.initTable_(b)
        }
    }
};
TableSort.initTable_ = function (a) {
    TableSort.tables.push(a);
    var t = TableSort.tables.length - 1;
    if (a.tHead) {
        for (var y = 0, row; row = a.tHead.rows[y]; y++) {
            for (var x = 0, cell; cell = row.cells[x]; x++) {
                TableSort.linkCell_(cell, t, x)
            }
        }
    }
    if (a.tFoot) {
        for (var y = 0, row; row = a.tFoot.rows[y]; y++) {
            for (var x = 0, cell; cell = row.cells[x]; x++) {
                TableSort.linkCell_(cell, t, x)
            }
        }
    }
    TableSort.lastSort[t] = 0
};
TableSort.linkCell_ = function (a, t, x) {
    if (TableSort.getClass_(a)) {
        var b = document.createElement('A');
        b.href = 'javascript:TableSort.click(' + t + ', ' + x + ', "' + escape(TableSort.getClass_(a)) + '");';
        if (TableSort.titleText) {
            b.title = TableSort.titleText
        }
        while (a.hasChildNodes()) {
            b.appendChild(a.firstChild)
        }
        a.appendChild(b);
        var c = document.createElement('SPAN');
        c.innerHTML = TableSort.arrowNone;
        c.className = 'TableSort_' + t + '_' + x;
        a.appendChild(c)
    }
};
TableSort.getClass_ = function (a) {
    var b = (a.className || '').toLowerCase();
    var c = b.split(/\s+/g);
    for (var x = 0; x < c.length; x++) {
        if (('compare_' + c[x]) in TableSort) {
            return c[x]
        }
    }
    return ''
};
TableSort.click = function (t, a, b) {
    var c = TableSort.tables[t];
    if (!b.match(/^[_a-z0-9]+$/)) {
        alert('Illegal sorting mode type.');
        return
    }
    var d = TableSort['compare_' + b];
    if (typeof d != 'function') {
        alert('Unknown sorting mode: ' + b);
        return
    }
    var e = false;
    if (Math.abs(TableSort.lastSort[t]) == a + 1) {
        e = TableSort.lastSort[t] > 0;
        TableSort.lastSort[t] *= -1
    } else {
        TableSort.lastSort[t] = a + 1
    }
    var f = 'TableSort_' + t + '_';
    var g = 'TableSort_' + t + '_' + a;
    var h = c.getElementsByTagName('SPAN');
    for (var s = 0, span; span = h[s]; s++) {
        if (span.className && span.className.substring(0, f.length) == f) {
            if (span.className.substring(0, g.length) == g) {
                if (e) {
                    span.innerHTML = TableSort.arrowDown
                } else {
                    span.innerHTML = TableSort.arrowUp
                }
            } else {
                span.innerHTML = TableSort.arrowNone
            }
        }
    }
    if (!c.tBodies.length) {
        return
    }
    var j = c.tBodies[0];
    var k = [];
    for (var y = 0, row; row = j.rows[y]; y++) {
        var l;
        if (row.cells.length) {
            l = row.cells[a]
        } else {
            l = row.childNodes[a]
        }
        k[y] = [TableSort.dom2txt_(l), row]
    }
    k.sort(d);
    for (y = 0; y < k.length; y++) {
        var i = e ? (k.length - 1 - y) : y;
        j.appendChild(k[i][1])
    }
};
TableSort.dom2txt_ = function (a) {
    if (!a) {
        return ''
    }
    if (a.nodeType == 3) {
        return a.data
    }
    var b = [];
    for (var x = 0, child; child = a.childNodes[x]; x++) {
        b[x] = TableSort.dom2txt_(child)
    }
    return b.join('')
};
TableSort.compare_case = function (a, b) {
    if (a[0] == b[0]) {
        return 0
    }
    return (a[0] > b[0]) ? 1 : -1
};
TableSort.compare_nocase = function (a, b) {
    var c = a[0].toLowerCase();
    var d = b[0].toLowerCase();
    if (c == d) {
        return 0
    }
    return (c > d) ? 1 : -1
};
TableSort.compare_num = function (a, b) {
    var c = parseFloat(a[0]);
    if (isNaN(c)) {
        c = -Number.MAX_VALUE
    }
    var d = parseFloat(b[0]);
    if (isNaN(d)) {
        d = -Number.MAX_VALUE
    }
    if (c == d) {
        return 0
    }
    return (c > d) ? 1 : -1
};
// initialized manually from main.js:

// if (window.addEventListener) {
    // window.addEventListener('load', TableSort.initAll, false)
// } else if (window.attachEvent) {
    // window.attachEvent('onload', TableSort.initAll)
// }
if (navigator.appName == 'Microsoft Internet Explorer' && navigator.platform.indexOf('Mac') == 0) {
    TableSort.enabled = false
}