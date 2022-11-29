
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

const fs = require("fs");
const fetch = require('node-fetch');
const rimraf = require('rimraf');
const readline = require('readline');
const crypto = require('crypto');
const pako = require('pako')


const SocketEnum = {
  INDEX_TOPIC: 'index topic',
  INDEX_DONE: 'index done',
  DIFF_INDEX_DONE: 'diff index done',
  QUERY_DONE: 'index query done',
  DIFF_QUERY_DONE: 'diff query done', 
  ERROR: 'index errors'
};

module.exports = {
  SocketEnum,
  clearFolder,
  randomValueBase64,
  compressStream,
  flatDeep,
  socketNotify,
  checkTimeout,
  delay,
  saveJsonObj,
  downloadResources,
  readLinesFile
}

//convert line-by-line to json

async function readLinesFile(filepath){

  return new Promise((resolve, reject) => {

      var returnJson =[]
      let rl = readline.createInterface({
          input: fs.createReadStream(filepath)
      });
      
      let line_no = 0; 
      // event is emitted after each line
      rl.on('line', function(line) {
          line_no++; 
          returnJson.push(JSON.parse(line.trim()))
      }); 
      // end
      rl.on('close', function(line) {
          console.log('Total lines : ' + line_no);
          resolve(returnJson)
      });
  }); 
}

//download file from S3
async function downloadResources( 
  url,headers,
  path,filename) { 

      const options = { method: 'GET', headers: headers }; 
      const res = await fetch(url,options); 
      const fileStream = fs.createWriteStream(path+filename); 

      return new Promise((resolve, reject) => {
          res.body.pipe(fileStream);
              res.body.on("error", (err) => {
              reject(err);
          });
          fileStream.on("finish", function(res) {
          resolve(filename);
          }); 
      }); 
}  

//save file stream to json file
async function saveJsonObj(path,filename,obj){

  return new Promise((resolve, reject) => {
      const stringToWrite = JSON.stringify(obj, null, ' ')
      // Trim leading spaces:
      .replace(/^ +/gm, '')
      // Add a space after every key, before the `:`:
      .replace(/: "(?:[^"]+|\\")*",?$/gm, ' $&');

      fs.writeFile(path+filename, 
      stringToWrite, function(err) { 
          if(err) {
              reject(err);
          } 
          resolve(path+filename + ' saved!');
      });  
  }); 
}

//to avoid the problem of 429 (too many requests in a time frame)
async function delay(t, v) {
  return new Promise(function (resolve) {
    setTimeout(resolve.bind(null, v), t);
  });
}

function socketNotify(topic, sockketData) {
  //notify client
  global.MyApp.SocketIo.emit(topic, JSON.stringify(sockketData));
}

async function clearFolder(folder) {
  return new Promise((resolve, reject) => {
    rimraf(folder + '/*', function () {
      console.log('clear output foler done');
      resolve();
    });
  });
}

function randomValueBase64(len) {
  return crypto.randomBytes(Math.ceil(len * 3 / 4))
    .toString('base64')   // convert to base64 format
    .slice(0, len)        // return required number of characters
    .replace(/\+/g, '0')  // replace '+' with '0'
    .replace(/\//g, '0'); // replace '/' with '0'
}


function compressStream(inputJson) {
  const inputStr = JSON.stringify(inputJson)
  return pako.deflate(inputStr)
}


function flatDeep(arr, d = 1) {
  return d > 0 ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatDeep(val, d - 1) : val), [])
    : arr.slice();
};

function checkTimeout(st, end) {
  return end - st < 5 * 60 * 1000  // 5 minutes
}

String.prototype.format = function () {
  var args = arguments;
  return this.replace(/\{(\d+)\}/g, function (m, i) {
    return args[i];
  });
};

