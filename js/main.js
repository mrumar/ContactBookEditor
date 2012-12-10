Array.prototype.remove = function(from, to) {
        var rest = this.slice((to || from) + 1 || this.length);
        this.length = from < 0 ? this.length + from : from;
        return this.push.apply(this, rest);
    }
    
ContactBookEditor = function() {
    var self = this, 
        people = [], 
        jsonURL = 'http://192.168.10.245:3000/contacts.json',
        body = $('body'),
        peopleListWrapper = $('.employees'),
        newPersonForm = {
            firstnameInput: $('.new-person-firstname'),
            lastnameInput: $('.new-person-lastname'),
            teamInput: $('.new-person-team'),
            phoneInput: $('.new-person-phone'),
            emailInput: $('.new-person-email')
        },
        message = $('#message');

    this.init = function() {
        self.loadJson();
        body.on('click', '#AddNewEmployee', self.addPerson);
    }

    this.createPerson = function(form) {
        return {
            'firstname' : form.firstnameInput.val(),
            'lastname' : form.lastnameInput.val(),
            'team' : form.teamInput.val(),
            'phone' : form.phoneInput.val(),
            'email' : form.emailInput.val()
        };
    }
    this.loadJson = function() {

         var xhr = new XMLHttpRequest();
         xhr.open('GET', jsonURL);
         xhr.overrideMimeType("text/plain");
         xhr.onreadystatechange = function () {
           if (xhr.status == 200 && xhr.readyState == 4) {
             people = jQuery.parseJSON(xhr.responseText);
             people = people.file || people;
             self.drawPeopleList();
           }
         };
         xhr.send();
    }
    this.drawPeopleList = function() {
        var peopleList = $('<table />'), i = 0, len = people.length, person = '';
        
        while (i < len) {
            person = $(self.personHtmlTmpl(i, people[i]));
            
            peopleList.append(person);
            i++;
        }
        // add event listeners
        peopleListWrapper.on('click', '.edit-btn', self.editPerson);
        peopleListWrapper.on('click', '.delete-btn', self.deletePerson);     
           
        peopleListWrapper.append(peopleList);
    }
    this.redrawPeopleList = function(){
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
        tpl += '<tr data-index='+index+'>';
        
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
        message.html('<p>'+msg+'</p>');
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
        var personRecord = $(e.target).closest('tr'),
            index = parseInt(personRecord.attr('data-index'));
        people.remove(index);
        self.redrawPeopleList();
        self.showMsg('Person removed.');
    } 
    this.savePerson = function(e) {
        var personRecord = $(e.target).closest('tr'),
            index = parseInt(personRecord.attr('data-index')),
            person;
            
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
    this.saveDataOnServer = function(){
        var xhr = new XMLHttpRequest(),
            data = JSON.stringify(people);
            
         xhr.open('PUT', jsonURL, false);         
         xhr.send('{"file": '+data+'}');
    }
    
}
/* ready */
$(function() {
    var contactBookEditor = contactBookEditor || new ContactBookEditor();
    contactBookEditor.init();
});
