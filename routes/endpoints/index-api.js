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

const express = require('express');
const IndexAPI = require('../services/index-api');
const { OAuth } = require('../services/oauth');
const config = require('../config')
const utility = require("../utility")
const index_data = require("../index-data")

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

let router = express.Router();

//verify valid authentication
router.use(async (req, res, next) => {

    const oauth = new OAuth(req.session);
    if (!oauth.isAuthorized()) {
        console.log('no valid authorization!')
        res.status(401).end('Please login first')
        return
    }
    req.oauth_client = oauth.getClient();
    req.oauth_token = await oauth.getInternalToken();
    config.credentials.token_3legged = req.oauth_token.access_token

    next();
});


//post indexing of diff
router.post('/index/:project_id/:isDiff', async (req, res) => {
    const project_id = req.params['project_id']
    const isDiff = req.params['isDiff']

    const payload = req.body
    res.status(200).end()

    try {
        //var result = await IndexAPI.postIndex(project_id, JSON.stringify(payload), isDiff)
        var result = await IndexAPI.postIndexBatchStatus(project_id, JSON.stringify(payload), isDiff)
        if (result == null) {
            console.log('post index failed: ')
            utility.socketNotify(utility.SocketEnum.INDEX_TOPIC,
                utility.SocketEnum.ERROR,
                { error: 'post index failed: ' })
            return
        }
        //const index_id = isDiff ? result.diffId : result.indexId
        //var state = result.state

        //because now we use batchStatus, and only one pair of diff, so get first item result[0]
        const index_id = isDiff ? result.diffs[0].diffId : result.indexes[0].indexId
        var state = isDiff ? result.diffs[0].state : result.indexes[0].state 
        while (state != 'FINISHED') {
            //keep polling
            result = await IndexAPI.getIndex(project_id, index_id, isDiff)
            state = result.state
        }

        //start to download data
        const { properties, fields, manifest } = await index_data.downloadIndexData(project_id, index_id, isDiff)

        //notify to client
        utility.socketNotify(utility.SocketEnum.INDEX_TOPIC, {
            message: utility.SocketEnum.INDEX_DONE,
            properties: properties,
            fields: fields,
            manifest: manifest
        })

    } catch (e) {
        // here goes out error handler
        console.log('post index failed: ' + e.message)
        utility.socketNotify(utility.SocketEnum.INDEX_TOPIC,
            utility.SocketEnum.ERROR,
            { error: e.message })
    }

});

module.exports = router;
