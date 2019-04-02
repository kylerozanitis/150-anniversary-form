const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const Dropbox = require('dropbox');
const fetch = require('node-fetch');

require('dotenv').config();

// Initialize Firebase authentication
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DB_URL
});

const db = admin.database();

const exportedMethods = {
  // Function to write nominee name, nominator name, nominator email, explanation, and file name to Firebase
  async writeData(eventObject, fileObject) {
    db.ref(`nominations/`).push({
      nomineeName: eventObject.nominee,
      nominatorName: eventObject.nominator,
      nominatorEmail: eventObject.email,
      explanation: eventObject.explanation,
      fileName: fileObject.originalname
    });
  },
  // Function to push file to Dropbox
  async uploadFile(fileObject) {
    const UPLOAD_FILE_SIZE_LIMIT = 150 * 1024 * 1024;
    const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
    const dbx = new Dropbox.Dropbox({
      accessToken: ACCESS_TOKEN,
      fetch: fetch
    });
    // const fileInput = fileObject;
    // const file = fileInput.files[0];
    const file = fileObject;

    if (file.size < UPLOAD_FILE_SIZE_LIMIT) {
      // File is smaller than 150 Mb - use filesUpload API
      dbx
        .filesUpload({
          path: '/File Requests/Photos/' + file.originalname,
          contents: file.buffer
        })
        .then(function(response) {
          // let results = document.getElementById('results');
          // results.appendChild(document.createTextNode('File uploaded!'));
          console.log('File Uploaded!');
          console.log(response);
        })
        .catch(function(error) {
          console.error(error);
        });
    } else {
      // File is bigger than 150 Mb - use filesUploadSession * API
      const maxBlob = 8 * 1000 * 1000; // 8Mb - Dropbox JavaScript API suggested max file / chunk size

      let workItems = [];

      let offset = 0;

      while (offset < file.size) {
        let chunkSize = Math.min(maxBlob, file.size - offset);
        workItems.push(file.slice(offset, offset + chunkSize));
        offset += chunkSize;
      }

      const task = workItems.reduce((acc, blob, idx, items) => {
        if (idx == 0) {
          // Starting multipart upload of file
          return acc.then(function() {
            return dbx
              .filesUploadSessionStart({ close: false, contents: blob })
              .then(response => response.session_id);
          });
        } else if (idx < items.length - 1) {
          // Append part to the upload session
          return acc.then(function(sessionId) {
            let cursor = { session_id: sessionId, offset: idx * maxBlob };
            return dbx
              .filesUploadSessionAppendV2({
                cursor: cursor,
                close: false,
                contents: blob
              })
              .then(() => sessionId);
          });
        } else {
          // Last chunk of data, close session
          return acc.then(function(sessionId) {
            let cursor = {
              session_id: sessionId,
              offset: file.size - blob.size
            };
            let commit = {
              path: '/' + file.name,
              mode: 'add',
              autorename: true,
              mute: false
            };
            return dbx.filesUploadSessionFinish({
              cursor: cursor,
              commit: commit,
              contents: blob
            });
          });
        }
      }, Promise.resolve());

      task
        .then(function(result) {
          // let results = document.getElementById('results');
          // results.appendChild(document.createTextNode('File uploaded!'));
          console.log('File Uploaded!');
        })
        .catch(function(error) {
          console.error(error);
        });
    }
  }
};

module.exports = exportedMethods;
