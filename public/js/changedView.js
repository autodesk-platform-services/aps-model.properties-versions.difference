/////////////////////////////////////////////////////////////////////
// Copyright 2022 Autodesk Inc
// Written by Develope Advacacy and Support
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

class ChangedView {

  constructor() {
    this._items = []
    this._view = null
  }

  async reset() {

    if (this._view)
      this._view.rows().clear().draw()
    this._items = []

  }

  //display a few properties 
  async initViewHeader() {
    var columns = [
      { field: 'p153cb174', title: "name", align: 'center' },
      { field: 'geom_changed', title: "geometry changed?", align: 'center' },
      { field: 'prop_changed', title: "property changed?", align: 'center' },
      { field: 'prop_list', title: "changed properties", align: 'center' },
      { field: 'p5eddc473', title: "category", align: 'center' },
      { field: 'svf2Id', title: "svf2Id", align: 'center' }
    ]
    $(`#changedView`).bootstrapTable('destroy');

    //initialize table header 
    $(`#changedView`).bootstrapTable({
      paginationParts: [],

      parent: this,
      data: [],
      editable: false,
      clickToSelect: true,
      cache: false,
      showToggle: false,
      showPaginationSwitch: false,
      pagination: false,
      pageList: [5, 10, 25, 50, 100],
      pageSize: 10,
      pageNumber: 1,
      uniqueId: 'id',
      striped: true,
      search: false,
      showRefresh: false,
      minimumCountColumns: 1,
      smartDisplay: true,
      columns: columns
    });

    $('#changedView').on('click-row.bs.table', function (e, row, $element, field) {

      //when one item of table view is clicked. 
      //highlight this element in both views
      apsViewer_left.clearThemingColors(apsViewer_left.model);
      apsViewer_left.showAll()

      apseViewer_right.clearThemingColors(apsViewer_right.model);
      apsViewer_right.showAll()

      apsViewer_right.setThemingColor(row.svf2Id, new THREE.Vector4(0, 0, 1, 1))
      apsViewer_left.setThemingColor(row.svf2Id, new THREE.Vector4(0, 0, 1, 1))

      apsViewer_right.isolate(row.svf2Id)
      apsViewer_left.isolate(row.svf2Id)

      apsViewer_right.fitToView(row.svf2Id)
      apsViewer_left.fitToView(row.svf2Id)

    })

  }

  unique(o) {
    var a = o.concat();
    for (var i = 0; i < a.length; ++i) {
      for (var j = i + 1; j < a.length; ++j) {
        if (a[i] === a[j])
          a.splice(j--, 1);
      }
    }

    return a;
  };

  changedPropertiesFormatter(value, row, index) {
    var re = `<select>`
    value.forEach(async element => {
      re += `<option>${element}</option>`;
    });
    re += `</select>`
    return re
  }

  async produceView(items) {

    this._items = items
    var itemsForShow = []
    items.forEach(async e => {
      var prop_list = []

      if (e.prev.props) {

        //list the changed properties
        const keys = Object.keys(e.prev.props)
        for (var index = 0; index < keys.length; index++) {
          var oneChangedProp = index_fields.find(i => i.key == keys[index])
          prop_list.push(`${oneChangedProp.name}`)
        }
      }

      //check if properties or geometries are changed
      var oneItem = {
        p153cb174: e.props.p153cb174,
        geom_changed: e.geomHash != e.prev.geomHash ? 'yes' : 'no',
        prop_changed: e.propsHash != e.prev.propsHash ? 'yes' : 'no',
        prop_list: prop_list,
        svf2Id: e.svf2Id
      }
      itemsForShow.push(oneItem)
    });
    var columns = [
      { field: 'p153cb174', title: "name", align: 'center' },
      { field: 'geom_changed', title: "geometry changed?", align: 'center' },
      { field: 'prop_changed', title: "property changed?", align: 'center' },
      { field: 'prop_list', title: "changed properties", align: 'left', formatter: this.changedPropertiesFormatter },
      { field: 'p5eddc473', title: "category", align: 'center' },
      { field: 'svf2Id', title: "svf2Id", align: 'center' }
    ]
    $(`#changedView`).bootstrapTable('destroy');
    $(`#changedView`).bootstrapTable({
      parent: this,
      data: itemsForShow,
      height: '300',
      editable: false,
      clickToSelect: true,
      cache: false,
      showToggle: false,
      showPaginationSwitch: false,
      pagination: false,
      pageList: [5, 10, 25, 50, 100],
      pageSize: 15,
      pageNumber: 1,
      paginationParts: [],
      uniqueId: 'id',
      striped: true,
      search: false,
      showRefresh: false,
      minimumCountColumns: 2,
      smartDisplay: true,
      columns: columns

    });

  }
}