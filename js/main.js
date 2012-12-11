Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
}
ContactBookEditor = function() {
    var self = this, people = [], jsonURL = 'http://192.168.10.245:3000/contacts.json', body = $('body'), peopleListWrapper = $('.employees'), newPersonForm = {
        firstnameInput : $('.new-person-firstname'),
        lastnameInput : $('.new-person-lastname'),
        teamInput : $('.new-person-team'),
        phoneInput : $('.new-person-phone'),
        emailInput : $('.new-person-email')
    }, message = $('#message');

    this.init = function() {
        self.loadJson();
        body.on('click', '#AddNewEmployee', self.addPerson);
    }

    this.createPerson = function(form) {
        return {
            'firstname' : form.firstnameInput.val(),
            'lastname' : form.lastnameInput.val(),
            'team' : form.teamInput.val(),
            'phone' : self.formatPhone(form.phoneInput.val()),
            'email' : form.emailInput.val()
        };
    }
    this.loadJson = function() {

        var xhr = new XMLHttpRequest();
        xhr.open('GET', jsonURL);
        xhr.overrideMimeType("text/plain");
        xhr.onreadystatechange = function() {
            if (xhr.status == 200 && xhr.readyState == 4) {
                people = jQuery.parseJSON(xhr.responseText);
                people = people.file || people;
                people = self.fixPhoneNumbers(people);
                self.drawPeopleList();
            }
        };
        xhr.send();
    }
    this.drawPeopleList = function() {
        var peopleList = $('<table id="EmployeesTable" />'), i = 0, len = people.length, person = '', thead = $('<thead><tr><th class="nocase">Firstname</th><th class="nocase">Lastname</th><th class="nocase">Team</th><th class="nocase">Phone</th><th class="email nocase">Email</th><th class="btn">&nbsp;</th></tr></thead>');

        peopleList.append(thead);

        while (i < len) {
            person = $(self.personHtmlTmpl(i, people[i]));

            peopleList.append(person);
            i++;
        }
        // add event listeners
        peopleListWrapper.on('click', '.edit-btn', self.editPerson);
        peopleListWrapper.on('click', '.delete-btn', self.deletePerson);

        peopleListWrapper.append(peopleList);

        // init sorting plugin
        TableSort.init('EmployeesTable');
    }
    this.redrawPeopleList = function() {
        // remove old list
        peopleListWrapper.off('click');
        peopleListWrapper.html('');
        // draw new list
        self.drawPeopleList();
        // save data on server
        self.saveDataOnServer();
    }
    this.personHtmlTmpl = function(index, personObj) {
        var tpl = '';
        tpl += '<tr data-index=' + index + '>';

        tpl += '<td class="firstname"><span class="view">' + personObj.firstname + '</span><input class="edit" type="text" value="' + personObj.firstname + '" /></td>';
        tpl += '<td class="lastname"><span class="view">' + personObj.lastname + '</span><input class="edit" type="text" value="' + personObj.lastname + '" /></td>';
        tpl += '<td class="team"><span class="view">' + personObj.team + '</span><input class="edit" type="text" value="' + personObj.team + '" /></td>';
        tpl += '<td class="phone"><span class="view">' + personObj.phone + '</span><input class="edit" type="tel" value="' + personObj.phone + '" /></td>';
        tpl += '<td class="email"><span class="view">' + personObj.email + '</span><input class="edit" type="email" value="' + personObj.email + '" /></td>';
        tpl += '<td class="btn"><button class="edit-btn view">edit</button><button class="delete-btn view">delete</button><button class="save-btn edit">save</button></td>';

        tpl += '</tr>';
        return tpl;
    }
    this.addPerson = function() {
        var newPerson = self.createPerson(newPersonForm);

        people.push(newPerson);
        self.redrawPeopleList();
        self.showMsg('New person added.');
    }
    this.showMsg = function(msg) {
        message.html('<p>' + msg + '</p>');
        if (message.css('display') == 'none') {
            message.css('display', 'block');
        }
        message.toggleClass('show-hide');
    }
    this.editPerson = function(e) {
        var personRecord = $(e.target).closest('tr');

        personRecord.find('.view').hide();
        personRecord.find('.edit').show();
        peopleListWrapper.on('click', '.save-btn', self.savePerson);
    }
    this.deletePerson = function(e) {
        var personRecord = $(e.target).closest('tr'), index = parseInt(personRecord.attr('data-index'));
        people.remove(index);
        self.redrawPeopleList();
        self.showMsg('Person removed.');
    }
    this.savePerson = function(e) {
        var personRecord = $(e.target).closest('tr'), index = parseInt(personRecord.attr('data-index')), person;

        person = {
            'firstname' : personRecord.find('.firstname input').val(),
            'lastname' : personRecord.find('.lastname input').val(),
            'team' : personRecord.find('.team input').val(),
            'phone' : personRecord.find('.phone input').val(),
            'email' : personRecord.find('.email input').val()
        };
        people[index] = person;

        personRecord.find('.edit').hide();
        personRecord.find('.view').show();

        self.redrawPeopleList();
        self.showMsg('Edited data saved.');

    }
    this.saveDataOnServer = function() {
        var xhr = new XMLHttpRequest(), data = JSON.stringify(people);

        xhr.open('PUT', jsonURL, false);
        xhr.send('{"file": ' + data + '}');
    }
    this.fixPhoneNumbers = function(arr) {
        var peopleArr = arr, len = peopleArr.length, i = 0;

        for (i; i < len; i++) {
            peopleArr[i].phone = self.formatPhone(peopleArr[i].phone);
        }

        return peopleArr;
    }
    this.formatPhone = function(str) {
        var phone = str, 
            pattern9digits = new RegExp('[0-9]{9}$', 'g'), 
            len = str.length,
            prefix = '';

        if (pattern9digits.test(phone)) {
            prefix = str.substring(0, len - 9);
            prefix = prefix.length > 0 ? prefix + ' ' : prefix;
            phone = prefix + str.substring(len - 9, len - 6) + ' ' + str.substring(len - 6, len - 3) + ' ' + str.substring(len - 3, len);
        }

        return phone;
    }
}
/* ready */
$(function() {
    var contactBookEditor = contactBookEditor || new ContactBookEditor();
    contactBookEditor.init();
});
