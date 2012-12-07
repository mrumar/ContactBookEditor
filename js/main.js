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
        };

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
        var peopleList = $('<ul />'), i = 0, len = people.length, person = '';
        
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
        tpl += '<li data-index='+index+'>';
        tpl += '<span class="firstname view">' + personObj.firstname + '</span>';
        tpl += '<span class="lastname view">' + personObj.lastname + '</span>';
        tpl += '<span class="team view">' + personObj.team + '</span>';
        tpl += '<span class="phone view">' + personObj.phone + '</span>';
        tpl += '<span class="email view">' + personObj.email + '</span>';
        tpl += '<span class="view"><button class="edit-btn">edit</button></span>';
        tpl += '<span class="view"><button class="delete-btn">delete</button></span>';
        
        tpl += '<span class="firstname edit"><input type="text" value="' + personObj.firstname + '" /></span>';
        tpl += '<span class="lastname edit"><input type="text" value="' + personObj.lastname + '" /></span>';
        tpl += '<span class="team edit"><input type="text" value="' + personObj.team + '" /></span>';
        tpl += '<span class="phone edit"><input type="text" value="' + personObj.phone + '" /></span>';
        tpl += '<span class="email edit"><input type="text" value="' + personObj.email + '" /></span>';
        tpl += '<span class="edit"><button class="save-btn">save</button></span>';
        
        tpl += '</li>';
        return tpl;
    }
    this.addPerson = function() {
        var newPerson = self.createPerson(newPersonForm);
        
        people.push(newPerson);
        self.redrawPeopleList();
        self.showMsg('New person added.');
    }
    this.showMsg = function(msg) {
        console.log(msg);
    }
    this.editPerson = function(e) {
        var personRecord = $(e.target).closest('li');
        
        personRecord.find('.view').hide();
        personRecord.find('.edit').show();
        peopleListWrapper.on('click', '.save-btn', self.savePerson);
    } 
    this.deletePerson = function(e) {
        var personRecord = $(e.target).closest('li'),
            index = parseInt(personRecord.attr('data-index'));
        people.remove(index);
        self.redrawPeopleList();
        self.showMsg('Person removed.');
    } 
    this.savePerson = function(e) {
        var personRecord = $(e.target).closest('li'),
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
