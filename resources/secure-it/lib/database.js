/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const { EventTarget } = require("sdk/event/target");
const { emit } = require('sdk/event/core');
const { Class } = require('sdk/core/heritage');

const { get, set } = require('pathfinder/storage');
let json = {};

let getP = get();
getP.then(({ data }) => json = (data && JSON.parse(data)) || { domains: {} });

let Database = Class({
  extends: EventTarget,
  getAll: function() {
    return getP.then(_ => json['domains']);
  },
  get: function({ domain }) {
    return getP.then(_ => !!json['domains'][domain])
  },
  add: function({ domains }) {
    return getP.then(_ => {
      domains.forEach(domain => {
        json['domains'][domain] = true;
        emit(this, 'domain:add', domain);
      });
      set({ data: JSON.stringify(json) });
      return undefined;
    })
  },
  remove: function({ domains }) {
    return getP.then(_ => {
      domains.forEach(domain => {
        delete json['domains'][domain];
        emit(this, 'domain:remove', domain);
      });
      set({ data: JSON.stringify(json) });
      return undefined;
    });
  },
  save: _ => set({ data: JSON.stringify(json) })
});

exports.Database = Database();
