// Use with: couchapp -d sample/couchapp.js -s -c http://127.0.0.1:5984/kickable

var couchapp = require('couchapp');

var ddoc = {
  _id:'_design/app', 
  shows: {}, 
  updates: {}, 
  views: {
    names: {
      map: function(doc) {
        if (doc.name) emit(doc.name, null);
      }
    },
    revs: {
      map: function(doc) {
        if (doc._rev) emit(doc._rev.split('-')[0], null);
      }
    }
  }, 
  lists: {}
};

exports.app = ddoc;
