# couchkicker

A node.js app that keeps your CouchDB views fresh.

This is a port & revision to the process demonstrated in Ruby & Python on the [CouchDB wiki](http://wiki.apache.org/couchdb/Regenerating_views_on_update)

## Node & NPM

You'll need [Node](http://nodejs.org/#download) & [Node Package Manager](http://npmjs.org/).

## CouchDB config

In the etc/couchdb/local.ini file, set:

``[update_notification]
couchkicker=/absolute/path/to/local/bin/node /absolute/path/to/couchkicker/lib/daemon.js``

