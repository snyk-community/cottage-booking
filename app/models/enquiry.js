define([
    'can/util/string',
    'resources/avail',
    'resources/book',
    'underscore',
    'moment',
    'utils',
    'can/model',
    'can/map/validations',
    'can/map/attributes'
], function(can, avail, booking, _, moment, utils){
    'use strict';

    return can.Model({
        update  : 'POST property/booking/enquiry',
        create  : 'POST property/booking/enquiry',

        defaults: {
            // The availability object so we can validate stays
            'avail': avail,
            'saveOnValid': true,
            'adults': 1
        },

        attributes: {
            fromDate: 'date',
            toDate: 'date'
        },

        convert: {
            'date': function( raw ) {
                if( typeof raw === 'number' ) {
                    return moment( raw * 1000 );
                } else if( typeof raw === 'string' ) {
                    return moment( raw, 'YYYY-MM-DD' );
                } else if( typeof raw === 'object' && raw.isValid && !raw.isValid() ) {
                    return null;
                }
                return raw;
            }
        },

        serialize: {
            'date': function( raw ) {
                return typeof raw === 'object' ? raw.format('YYYY-MM-DD') : raw;
            }
        },

        // We only need this attributes to make an enquiry
        required: [
            'propRef',
            'fromDate',
            'toDate',
            // 'nights',
            'adults'
            // 'children',
            // 'infants',
            // 'pets'
        ],

        'init': function() {
            this.validate('fromDate', function( fromDate ) {
                if( !this.attr('toDate') ) {
                    return false;
                }

                if( fromDate && !fromDate.isValid() ) {
                    return 'Invalid date';
                }

                if( fromDate < utils.now() ) {
                    return 'Your stay should be in the future';
                }

                if( fromDate > this.attr('toDate') ) {
                    return 'The start of your stay must be before the end';
                }

                return false;
            });

            this.validate('toDate', function( toDate ) {
                if( !this.attr('fromDate') ) {
                    return false;
                }

                if( toDate && !toDate.isValid() ) {
                    return 'Invalid date';
                }

                if( toDate < this.attr('fromDate') ) {
                    return 'The end of your stay must be after the start';
                }

                return false;
            });

            this.validate('status', function( status ) {
                if( status && status !== 'ok' ) {
                    return this.attr('message') || 'An unknown error occurred';
                }
            });

            this.validatePresenceOf( this.required, {
                'message': 'The {label} field is required'
            });
        }

    }, {

        'init': function() {
            var prox;
            if( this.saveOnValid ) {
                prox = can.proxy( this.validSaveHandler, this );
                this.on('fromDate', prox);
                this.on('toDate', prox);
            }

            prox = can.proxy( this.resetOnDateChangeHandler, this );
            this.on('fromDate', prox);
            this.on('toDate', prox);

            // *welsh accent* Tidy
            this.removeAttr('saveOnValid');

            this.on( 'propRef', can.proxy( this.propRefChangeHandler, this ) );
        },

        'resetOnDateChangeHandler': function() {
            var keep;

            if( this.attr('status') || this.errors() ) {
                keep = _.keys( this.constructor.defaults ).concat( this.constructor.required );
                this.each(function( val, attr ) {
                    if( can.inArray( attr, keep ) === -1 ) {
                        this.removeAttr( attr );
                    }
                }, this);
            }

        },

        'destroy': function() {
            this.off('fromDate');
            this.off('toDate');
            this.off('propRef');

            return can.Model.prototype.destroy.call( this );
        },

        'make': function() {
            return booking.fetchBooking( this.serialize() ).fail(can.proxy(function( failedBooking ) {
                // On error proxy the failed booking object back over here, just taking the interesting bits
                var err;
                if( failedBooking.responseText ) {
                    err = JSON.parse( failedBooking.responseText );
                    this.attr( err );
                } else {
                    this.attr({
                        'status': 'error',
                        'message': 'A fatal error has occurred, sorry for any inconveniences.'
                    });
                }
            }, this));
        },

        // If we hear about a new propref re-fetch the availability data
        'propRefChangeHandler': function( obj, newVal ) {
            return this.avail( newVal );
            // we _could_ clear stuff etc
        },

        'validSaveHandler': function() {
            var from = this.attr('fromDate'),
                to = this.attr('toDate');

            if( from && to ) {

                if( !this.errors() ) {
                    this.save();
                }

            }
        },

        // TODO: move this sort of functionality into getClassesFor or something
        'fallsBetween': function( date ) {

            var from = this.attr('fromDate'),
                to = this.attr('toDate');

            if( !to || !from ) {
                return false;
            }

            return ( date >= from && date <= to );
        },

        /**
         * This function generates the array required for each day to be represented correctly
         * on a jquery datepicker calendar.
         * TODO: Tooltips contain error data and other nice information
         * TODO: Investigate whether this hard working function should be else where
         * @function generateCalendarRenderArray
         * @param  {Date} date   Date to generate for
         * @return {Array}       array of data to populate [available, classe(s), tooltips?]
         */
        'generateCalendarRenderArray': function( date ) {
            var availability = this.avail(),
                enableDay = false,
                dayData,
                errors = this.errors(),
                dayClasses = [],
                tooltip = '';

            // mox it in tests
            if( date > utils.now() ) {
                if( availability ) {
                    dayData = availability.attr( date );

                    if( dayData ) {
                        // Get availability
                        enableDay = dayData.attr('available');

                        if( enableDay && this.fallsBetween( date ) ) {
                            dayClasses.push('selected');

                            // If we have a selection to show, and there's errors
                            if( errors ) {
                                dayClasses.push('errors');

                                // Look to add errors
                                if( errors.status ) {
                                    tooltip = errors.status[0];
                                } else {
                                    tooltip = 'Good to go!';
                                }
                            }
                        }

                        // Add other misc classes
                        dayClasses.push( 'code-' + dayData.attr('code') );
                        dayClasses.push( dayData.attr('changeover') ? 'changeover' : '' );
                    }
                }
            }
            return [enableDay, dayClasses.join(' '), tooltip];
        }

    });

});