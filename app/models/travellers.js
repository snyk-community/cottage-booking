define(['can/util/string', 'models/traveller', 'underscore', 'utils'], function( can, Traveller, _, utils ) {
    'use strict';

    Traveller.List = Traveller.List.extend({

        _store: {},

        'type': function( type ) {
            return type ? ( _.groupBy( this, 'type' )[ type ] || [] ) : _.groupBy( this, 'type' );
        },

        'removeType': function( type ) {
            for (var i = this.length - 1; i >= 0; i--) {
                if( this[i].type === type ) {
                    return this.removeAttr( i );
                }
            }
            return false;
        },

        'mutate': function( types ) {
            var current = this.type(),
                status = true;

            // This is awesome
            can.batch.start();

            can.each( current, function( travs, type ) {
                var add;

                if( !this._store[type] || this._store[type].length < travs.length ) {
                    this._store[ type ] = travs;
                }

                if( !types[ type ] ){
                    types[ type ] = 0;
                }

                if( types[ type ] > travs.length ) {
                    add = travs.length;

                    while( this.type( type ).length < types[ type ] ) {
                        if( this._store[ type ] ) {
                            this.push( this._store[ type ][ add++ ] || new Traveller({'type': type}) );
                        } else {
                            this.push( new Traveller({'type': type}) );
                        }
                    }
                } else if( current[ type ] ) {

                    while( this.type( type ).length > types[ type ] && status ) {
                        status = this.removeType( type );
                    }

                }

                delete types[ type ];

            }, this );

            if( _.filter( types, _.identity ).length ) {
                // By now we should only need to add new ones
                can.each( types, function( count, type ) {
                    this.push.apply( this, utils.rangeOfClasses( count, Traveller, {'type': type} ) );
                }, this );
            }

            // down here, only fire the events once we've made all our changes
            can.batch.stop();
            return this;
        }
    });

    return Traveller;

});