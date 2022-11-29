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


const SocketEnum = {
  INDEX_TOPIC: 'index topic',
  INDEX_DONE: 'index done',
  DIFF_INDEX_DONE: 'diff index done',
  QUERY_DONE: 'index query done',
  DIFF_QUERY_DONE: 'diff query done',
  ERROR: 'index errors'
};

//socket host 
const HOST_URL = window.location.host;
socketio = io.connect('http://' + HOST_URL);
socketio.on(SocketEnum.INDEX_TOPIC, async (d) => {

//stop running
$('#compare_img')[0].src = './img/OIP-C.jpeg'

  const jsonData = JSON.parse(d)

  switch (jsonData.message) {
    case SocketEnum.INDEX_DONE:
      console.log('index done')
      //refresh the tables
      const properties = jsonData.properties
      const addedItems = properties.filter(i => i.type == 'OBJECT_ADDED'//) 
        && i.views && i.views.length > 0)
      const removedItems = properties.filter(i => i.type == 'OBJECT_REMOVED'//) 
        && i.prev.views && i.prev.views.length > 0)
      const changedItems = properties.filter(i => i.type == 'OBJECT_CHANGED' //) 
        && i.views && i.views.length > 0)
      index_fields = jsonData.fields

      $('#addedTitle').html(`Added Items (${addedItems.length})`)
      $('#removedTitle').html(`Removed Items (${removedItems.length})`)
      $('#changedTitle').html(`Changed Items (${changedItems.length})`)

      //render tables with diff data
      global_AddedView.produceView(addedItems)
      global_RemovedView.produceView(removedItems)
      global_ChangedView.produceView(changedItems) 

      console.log(SocketEnum.DIFF_INDEX_DONE)
      $.notify(SocketEnum.DIFF_INDEX_DONE,'warn');   
      break;

    case SocketEnum.ERROR:
      $('.req_progress').hide();
      console.log(SocketEnum.ERROR)
      $.notify(SocketEnum.ERROR,'warn');   

      break;
  }
})