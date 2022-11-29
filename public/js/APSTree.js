/////////////////////////////////////////////////////////////////////
// Copyright 2022 Autodesk Inc
// Written by Develope Advacacy and Support
//
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////


var modelindex = 0;  
 
$(document).ready(function () {  

  // first, check if current visitor is signed in
  jQuery.ajax({
    url: '/api/aps/oauth/token',
    success: function (res) {
      // yes, it is signed in...
      $('#signOut').show();
      $('#refreshHubs').show();

      // prepare sign out
      $('#signOut').click(function () {
        $('#hiddenFrame').on('load', function (event) {
          location.href = '/api/aps/oauth/signout';
        });
        $('#hiddenFrame').attr('src', 'https://accounts.autodesk.com/Authentication/LogOut');
        // learn more about this signout iframe at
        // https://forge.autodesk.com/blog/log-out-forge
      })

      // and refresh button
      $('#refreshHubs').click(function () {
        $('#userHubs').jstree(true).refresh();
      });

      // finally:
      prepareUserHubsTree();
      showUser();
    }
  });

  $('#autodeskSigninButton').click(function () {
    jQuery.ajax({
      url: '/api/aps/oauth/url',
      success: function (url) {
        location.href = url;
      }
    });
  })

  jQuery.ajax({
    url: '/api/aps/oauth/clientId',
    success: function (res) {
      $('#clientId').val(res.clientId);
      $("#provisionAccountSave").click(function () {
        $('#provisionAccountModal').modal('toggle');
        $('#userHubs').jstree(true).refresh();
      });
    }
  });
});

function prepareUserHubsTree() {
  $('#userHubs').jstree({
    'core': {
      'themes': { "icons": true },
      'multiple': false,
      'data': {
        "url": '/api/aps/datamanagement',
        "dataType": "json",
        'cache': false,
        'data': function (node) {
          $('#userHubs').jstree(true).toggle_node(node);
          return { "id": node.id };
        }
      }
    },
    'types': {
      'default': { 'icon': 'glyphicon glyphicon-question-sign' },
      '#': { 'icon': 'glyphicon glyphicon-user' },
      'hubs': { 'icon': './img/a360hub.png' },
      'personalHub': { 'icon': './img/a360hub.png' },
      'bim360Hubs': { 'icon': './img/bim360hub.png' },
      'bim360projects': { 'icon': './img/bim360project.png' },
      'a360projects': { 'icon': './img/a360project.png' },
      'accprojects': { 'icon': './img/accproject.svg' }, 
      'folders': { 'icon': 'far fa-folder' },
      'items': { 'icon': 'far fa-file' },
      'bim360documents': { 'icon': 'far fa-clock' },
      'versions': { 'icon': 'far fa-clock' },
      'unsupported': { 'icon': 'glyphicon glyphicon-ban-circle' }
    },
    "sort": function (a, b) {
      var a1 = this.get_node(a);
      var b1 = this.get_node(b);
      var parent = this.get_node(a1.parent);
      if (parent.type === 'items') { // sort by version number
        var id1 = Number.parseInt(a1.text.substring(a1.text.indexOf('v') + 1, a1.text.indexOf(':')))
        var id2 = Number.parseInt(b1.text.substring(b1.text.indexOf('v') + 1, b1.text.indexOf(':')));
        return id1 > id2 ? 1 : -1;
      }
      else if (a1.type !== b1.type) return a1.icon < b1.icon ? 1 : -1; // types are different inside folder, so sort by icon (files/folders)
      else return a1.text > b1.text ? 1 : -1; // basic name/text sort
    },
    "plugins": ["types", "state", "sort"],
    "state": { "key": "autodeskHubs" }// key restore tree state
  }).bind("activate_node.jstree", function (evt, data) {
    if (data != null && data.node != null && (data.node.type == 'versions' || data.node.type == 'bim360documents')) {
      // in case the node.id contains a | then split into URN & viewableId
      if (data.node.id.indexOf('|') > -1) {
       
        var id = data.node.id.split('|')[0]; 
        var urn = data.node.id.split('|')[1];  
        project_id = data.node.id.split('|')[2].split('b.')[1];
        if (modelindex == 0) {
          loadModel(apsViewer_left, urn)
          modelindex = 1
          model_version_left = id
        } 
        else if (modelindex == 1) {
          loadModel(apsViewer_right, urn)
          modelindex = 0
          model_version_right = id 
        }
      }
      else { 
      }
    }
  });
}

function showUser() {
  jQuery.ajax({
    url: '/api/aps/user/profile',
    success: function (profile) {
      var img = '<img src="' + profile.picture + '" height="30px">';
      $('#userInfo').html(img + profile.name);
    }
  });
}