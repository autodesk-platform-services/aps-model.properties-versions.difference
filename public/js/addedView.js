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

class AddedView {

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
            { field: 'p5eddc473', title: "category", align: 'center' },
            { field: 'p01bbdcf2', title: "level", align: 'center' },
            { field: 'p20d8441e', title: "RC", align: 'center' },
            { field: 'p2508403c', title: "Free Size", align: 'center' },
            { field: 'p875a6521', title: "Size", align: 'center' },
            { field: 'svf2Id', title: "svf2Id", align: 'center' }
        ]
        $(`#addedView`).bootstrapTable('destroy');

        //initialize table header
        $(`#addedView`).bootstrapTable({
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

        $('#addedView').on('click-row.bs.table', function (e, row, $element, field) {

            //when one item of table view is clicked.

            //highlight this element
            apsViewer_right.clearThemingColors(apsViewer_right.model);
            apsViewer_right.showAll()
            apsViewer_right.setThemingColor(row.svf2Id, new THREE.Vector4(0, 1, 0, 1))   
            apsViewer_left.clearThemingColors(apsViewer_left.model);
            apsViewer_left.showAll()

            //zooming to the element by bounding-box 
            const selectedItem = global_AddedView._items.find(i => i.svf2Id == row.svf2Id)
            if (selectedItem) {
                 var fragbBox = new THREE.Box3();   
                fragbBox.max.x = selectedItem.bboxMax.x - apsViewer_left.model.getGlobalOffset().x
                fragbBox.max.y = selectedItem.bboxMax.y - apsViewer_left.model.getGlobalOffset().y
                fragbBox.max.z = selectedItem.bboxMax.z - apsViewer_left.model.getGlobalOffset().z
                fragbBox.min.x = selectedItem.bboxMin.x - apsViewer_left.model.getGlobalOffset().x
                fragbBox.min.y = selectedItem.bboxMin.y - apsViewer_left.model.getGlobalOffset().y
                fragbBox.min.z = selectedItem.bboxMin.z - apsViewer_left.model.getGlobalOffset().z
                var fragbBox = getBoundingBoxByViewerAPI(apsViewer_right, row.svf2Id)
                fragbBox.expandByScalar(3) 
                apsViewer_right.navigation.fitBounds(true, fragbBox)
                apsViewer_right.navigation.fitBounds(true, fragbBox)
            } 
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

   //update the table with new data
    async produceView(items) {
        this._items = items

        var itemsForShow = []
        items.forEach(async e => {
            var oneItem = {
                p153cb174: e.props.p153cb174,
                p5eddc473: e.props.p5eddc473,
                p01bbdcf2: e.props.p01bbdcf2,
                p20d8441e: e.props.p20d8441e,
                p2508403c: e.props.p2508403c,
                p875a6521: e.props.p875a6521,
                svf2Id: e.svf2Id
            }
            itemsForShow.push(oneItem)
        });
        var columns = [
            { field: 'p153cb174', title: "name", align: 'center' },
            { field: 'p5eddc473', title: "category", align: 'center' },
            { field: 'p01bbdcf2', title: "level", align: 'center' },
            { field: 'p20d8441e', title: "RC", align: 'center' },
            { field: 'p2508403c', title: "Free Size", align: 'center' },
            { field: 'p875a6521', title: "Size", align: 'center' },

            { field: 'svf2Id', title: "svf2Id", align: 'center' }
        ]
        $(`#addedView`).bootstrapTable('destroy');
        $(`#addedView`).bootstrapTable({
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


