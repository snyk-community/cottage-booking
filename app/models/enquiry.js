define(['can/util/string', 'resources/avail', 'can/model', 'can/map/validations'], function(can, avail){
    'use strict';

    return can.Model({
        // update  : 'POST tabs_property/{propRef}/booking/enquiry',
        // create  : 'POST tabs_property/{propRef}/booking/enquiry',
        update  : 'POST tabs_property/nope/booking/enquiry',
        create  : 'POST tabs_property/nope/booking/enquiry',

        // attributes: {
        //     'propRef': 'string',
        //     'fromDate': 'string',
        //     'nights': 'string',
        //     'adults': 'string',
        //     'children': 'string',
        //     'infants': 'string',
        //     'pets': 'string',
        // }
        defaults: {
            // The availability object so we can validate stays
            'avail': avail,
            'partySize': 1
        },

        'init': function() {
            this.validate('fromDate', function(fromDate) {
                return false;
            });

            this.validatePresenceOf('propRef');
        }

    }, {

        'serialize': function() {
            var serialized = can.Model.prototype.serialize.call( this );
            return serialized;
        }

    });

});