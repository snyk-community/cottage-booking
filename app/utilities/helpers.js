define(['can/util/string', 'accounting', 'can/view/ejs'], function( can, accounting ) {
    'use strict';

    can.extend( can.EJS.Helpers.prototype, {
        money: function( value, format ) {
            return accounting.formatMoney( value, {
                format: format,
                symbol: '£'
            });
        },

        appendTemplate: function( templFn, data ) {
            return function( el ) {
                can.$(el).append( templFn( data ) );
                //can.$(templFn( data )).insertAfter( el );
            };
        },

        replaceWithTemplate: function( templFn, data ) {
            return function( el ) {
                can.$(el).replace( templFn( data ) );
                //can.$(templFn( data )).insertAfter( el );
            };
        },

        sub: can.sub,

        content: function( controlInst ) {
            return function( el ) {
                //can.$( el ).addClass();
                controlInst.options.content = can.$( el );
            };
        }
    });

    return can;

});