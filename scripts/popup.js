// Adding a listener for receipt of a message from a script.
chrome.runtime.onMessage.addListener(function(request, sender) {
    if ('getSource' === request.action) {
        prepareHTML(request.source);
    }
});

// get the url of the tab the extension is opened on and
// set some globals which can be used at other places in
// the code.
chrome.tabs.getSelected(null, function(tab) {
    pageUrl = tab.url;
    protocol = 'http';
    //find & remove protocol (http, ftp, etc.) and get domain
    if (-1 < pageUrl.indexOf("://")) {
        domain = pageUrl.split('/')[2];
        protocol = pageUrl.split('://')[0];
    } else {
        domain = pageUrl.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];
    origin = protocol + '://' + domain;
});

/*
    This method prepares the html from the raw source which is passed.
    Regular expression look for records from the raw source.
*/
function prepareHTML(source) {
    $("#progress").removeClass('hide');
    var configs = [
        {
            header : 'Knowledge Articles',
            pattern : /KB\d{7}/g,
            url : origin + '/kb_view.do?sysparm_article=',
            tableName : 'kb_knowledge',
            fields : 'short_description',
            labelsMap : {
                'short_description' : 'Short description'
            },
            limit : 1
        },
        {
            header : 'Problems',
            pattern : /PRB\d{6}/g,
            url : origin + '/problem.do?sysparm_query=number=',
            tableName : 'problem',
            fields : 'problem_state,description,priority',
            labelsMap : {
                'problem_state' : 'Problem state',
                'description' : 'Description',
                'priority' : 'Priority'
            },
            fieldsMap : {
                'problem_state' : {
                    '-40' : 'New',
                    '-42' : 'Investigation',
                    '1' : 'Confirmed',
                    '2' : 'Work in Progress',
                    '9' : 'Testing',
                    '3' : 'Closed'
                },
                'priority' : {
                    '0' : 'Critical (Outage)',
                    '2' : 'High',
                    '3' : 'Moderate',
                    '4' : 'Low',
                    '5' : 'Planning'
                }
            },
            limit : 1
        },
        {
            header : 'Tasks',
            pattern : /INT\d{7}/g,
            url : origin + '/incident.do?sysparm_query=number=',
            tableName : 'incident',
            fields : 'severity,description',
            labelsMap : {
                'severity' : 'Severity',
                'description' : 'Description'
            },
            limit : 1
        },
        {
            header : 'Fix Targets',
            pattern : /FIX\d{7}/g,
            url : origin + '/u_fix_target.do?sysparm_query=number=',
            tableName : 'u_fix_target',
            fields : 'description,state',
            labelsMap : {
                'state' : 'State',
                'description' : 'Description'
            },
            fieldsMap : {
                'state' : {
                    '-50' : 'Draft',
                    '-51' : 'Awaiting Fix',
                    '2' : 'Work in Progress',
                    '-7' : 'Ready for Testing',
                    '-52' : 'Testing Failed',
                    '3' : 'Closed'
                }
            },
            limit : 1
        },
        {
            header : 'Stories',
            pattern : /STRY\d{7}/g,
            url : origin + '/rm_story.do?sysparm_query=number=',
            tableName : 'rm_story',
            fields : 'description,state',
            labelsMap : {
                'state' : 'State',
                'description' : 'Description'
            },
            fieldsMap : {
                'state' : {
                    '-6' : 'Draft',
                    '1' : 'Ready',
                    '2' : 'Work in progress',
                    '-7' : 'Ready for testing',
                    '-8' : 'Testing',
                    '3' : 'Complete',
                    '4' : 'Cancelled',
                    '6' : 'Accepted',
                    '5' : 'Ready for acceptance'
                }
            },
            limit : 1
        }
    ];

    for (var i = 0; i < configs.length; i++) {
        var config = configs[i];
        // preparing the list container.
        var itemListContainer = document.createElement('div');

        // preparing the unordered list.
        var itemUl = document.createElement('ul');
        itemUl.setAttribute('class', 'collection with-header text-primary');
        itemUl.appendChild(prepareListHeader(config.header));

        var items = source.match(config.pattern);

        if (items) {
            prepareListElements(itemUl, items, config);
            itemListContainer.appendChild(itemUl);
            listContainer.append(itemListContainer);
        }
    }
    $("#progress").hide();
    listContainer.removeClass('hide');
}

function prepareListHeader(listHeaderText) {
    var listHeader = document.createElement('li');
    listHeader.setAttribute('class', 'collection-header blue darken-3');
    listHeader.innerHTML = listHeaderText;

    return listHeader;
}

/*
    This method prepares a list element part of an unordered list. Each record type is a
    `ul` and each record is a `li`.
*/
function prepareListElements(ul, items, config) {
    var items_map = [];

    for (var i=0; i < items.length; i++) {
        if (undefined === items_map[items[i]]) {
            // fire up an ajax request to fetch data about the item found.
            var apiUrl = origin + '/api/now/table/' + config.tableName + '?sysparm_query=number='
                + items[i] + '&sysparm_fields=' + config.fields + '&sysparm_limit=' + config.limit;
            
            // putting stuff inside a self executing function
            // so that the ajax closure takes the latest value from
            // the items array.
            (function (item) {
                $.ajax({
                    url : apiUrl,
                    async : true,
                    contentType : 'application/json',
                    headers : {
                        'Authorization' : 'Basic ' + btoa($("#username").val() + ':' + $("#password").val())
                    },
                    dataType : 'json',
                    success : function (data) {
                        var results = data.result;
                        if (0 < results.length) {
                            var li = document.createElement('li');
                            li.setAttribute('class', 'collection-item blue lighten-5');
                            // Create the item link.
                            var link = document.createElement('a');
                            link.setAttribute('href', config.url + item);
                            link.setAttribute('target', '_blank');
                            link.innerHTML = item;
                            // Add the link to the li.
                            li.appendChild(link);
                            for (var j=0; j < results.length; j++) {
                                for (var field in results[j]) {
                                    if (results[j].hasOwnProperty(field)) {
                                        // Prepare the header of the value to be displayed.
                                        var parHeading = document.createElement('p');
                                        parHeading.setAttribute('class', 'text-secondary');
                                        parHeading.innerHTML = '<b>' + config.labelsMap[field] + '</b>';
                                        li.appendChild(parHeading);

                                        var par = document.createElement('p');
                                        par.setAttribute('class', 'text-secondary');
                                        if (0 < results[j][field].length) {
                                            // check if we have a mapping set for displaying
                                            // the values.
                                            if (config.fieldsMap) {
                                                // check if we have a mapping for this
                                                // specific field.
                                                if (config.fieldsMap[field]) {
                                                    par.innerHTML = config.fieldsMap[field][results[j][field]];
                                                } else {
                                                    par.innerHTML = results[j][field];
                                                }
                                            } else {
                                                par.innerHTML = results[j][field];
                                            }
                                        } else {
                                            // If the content is empty then display dashes instead.
                                            par.innerHTML = '-----';
                                        }
                                        li.appendChild(par);
                                    }
                                }
                            }
                            ul.appendChild(li);
                        }
                    }
                });
            }) (items[i]);
            // Add the ids to the map to avoid duplicates.
            items_map[items[i]] = 1;
        }
    }
}

function prepareNotFoundElement(message) {
    var li = document.createElement('li');
    li.setAttribute('class', 'collection-item red lighten-4');
    li.innerHTML = message;

    return li;
}

function executeScript() {
    listContainer = $('#listContainer');

    chrome.tabs.executeScript(null, {
        file: 'scripts/getPagesSource.js'
    }, function() {
        // If you try and inject into an extensions page or the webstore/NTP you'll get an error
        if (chrome.runtime.lastError) {
            listContainer.addClass('red lighten-4');
            listContainer.html('There was an error injecting script : \n' + chrome.runtime.lastError.message);
        }
    });
}

/*
    Method which shows the success notification and calls the callback
    after the notification fades away.
*/
function showSuccessNotification(callback) {
    $("#notificationIcon").addClass('success')
        .html('verified_user');
    $("#notificationMessage").html('Success!');
    // Show the message and hide after a second.
    // process the page source for records.
    $("#notification").removeClass('hide').delay(600).fadeOut(300, callback);
}

/*
    Method which shows the error notification.    
*/
function showErrorNotification() {
    $("#notificationIcon").addClass('error').html('error');
    $("#notificationMessage").html('Invalid credentials!');
    // Show the message and hide after a second.
    $("#notification").removeClass('hide').delay(1000).fadeOut(300);
}

/*
    This method takes the user credentials and just fires an ajax call to
    some API just to see whether the credentials are correct or not.
*/
function verifyUser() {
    // fire an ajax to the servicenow API to verify the credentials.
    $.ajax({
        url : origin + '/api/now/table/sys_user?sysparm_fields=&sysparm_limit=1',
        contentType : 'application/json',
        headers : {
            'Authorization' : 'Basic ' + btoa($("#username").val() + ':' + $("#password").val())
        },
        dataType : 'json',
        success : function (data) {
            // hide the form, show success notification and execute the script.
            $("#formContainer").hide();
            showSuccessNotification(executeScript);
        },
        error : function (error) {
            showErrorNotification();
        }
    });
}
/*
    This method is used when a person is trying to use the extension on
    a non service-now.com domain.
*/
function showNoServiceNotification() {
    $("#notificationIcon").addClass('error').html('report_problem');
    $("#notificationMessage").html('App only works for service-now domain!');
    // Show the message and hide after a second.
    $("#formContainer").hide();
    $("#notification").removeClass('hide');
}

// When the DOM is ready, then do stuff.
$(function() {
    // When the DOM is ready then check for whether we have the
    // credentials saved or not in the local storage.
    if (localStorage.getItem('username') && localStorage.getItem('password')) {
        $("#username").val(localStorage.getItem('username'));
        $("#password").val(localStorage.getItem('password'));
        $("#rememberMe")[0].checked = true;
    }
    // When the log-in form is submitted.
    $("#userForm").submit(function (event) {
        // prevent the usual submission of the form.
        event.preventDefault();
        // The extension should work only on the below pattern of domain name.
        var pattern = /^https?:\/\/([a-zA-Z\d-]+\.){0,}service-now\.com/g;
        if (origin.match(pattern)) {
            // check if the user has selected the remember me checkbox. If yes
            // then we need to store the credentials in browser session storage
            // so as to avoid any re-logins.
            if ($("#rememberMe")[0].checked) {
                localStorage.setItem('username', $("#username").val());
                localStorage.setItem('password', $("#password").val());
            }
            verifyUser();
        } else {
            showNoServiceNotification();
        }
    });
});