import { Factory } from 'meteor/dburles:factory';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { chai, assert } from 'meteor/practicalmeteor:chai';
import { Random } from 'meteor/random';
import { resetDatabase } from 'meteor/xolvio:cleaner';

import { _ } from 'meteor/underscore';
import { Plants } from '../plants.js';
import './publications.js';

describe('plants', function () {
  describe('mutators', function () {
    it('builds correctly from factory', function () {
      const plant = Factory.create('plant',{userId:Random.id()});
      assert.typeOf(plant, 'object');
      assert.typeOf(plant.createdAt, 'date');
    });
    it('leaves createdAt on update', function () {
      const createdAt = new Date(new Date() - 1000);
      let plant = Factory.create('plant', { createdAt, userId:Random.id() });
      const name = 'some new name';
      Plants.update(plant, { $set: { name } });
      plant = Plants.findOne(plant._id);
      assert.equal(plant.name, name);
      assert.equal(plant.createdAt.getTime(), createdAt.getTime());
    });
  });
  describe('publications', function () {
    let userId;
    before(function () {
      resetDatabase();
      userId = Random.id();
      _.times(3, () => {
        Factory.create('plant', { userId });
      });
    });
    describe('plants', function () {
      it('sends no plants if not logged in', function (done) {
        const collector = new PublicationCollector();
        collector.collect(
          'plants',
          {},
          (collections) => {
            chai.assert.isUndefined(collections.todos);
            done();
          }
        );
      });
      it('sends plants if logged in', function (done) {
        const collector = new PublicationCollector({userId});
        collector.collect(
          'plants',
          {},
          (collections) => {
            chai.assert.equal(collections.plants.length, 3);
            done();
          }
        );
      });
      it('sends no plants if logged in as another user', function (done) {
        const collector = new PublicationCollector({userId:Random.id()});
        collector.collect(
          'plants',
          {},
          (collections) => {
            chai.assert.isUndefined(collections.todos);
            done();
          }
        );
      });
    });
  });
});