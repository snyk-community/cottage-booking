requirejs.config({
    paths: {
        'can'             : 'bower_components/canjs/amd/can',
        'jquery'          : 'bower_components/jquery/jquery',
        'ejs'             : 'bower_components/require-can-renderers/lib/ejs',
        'jqueryui'        : 'bower_components/jquery-ui/jqueryui',
        'moment'          : 'bower_components/momentjs/moment',
        'underscore'      : 'bower_components/underscore/underscore',
        'accounting'      : 'bower_components/accounting.js/accounting',
        'spin'            : 'bower_components/spin.js/spin',
        'spinner'         : 'bower_components/spin.js/jquery.spin',
        'idle'            : 'bower_components/jquery-idletimer/dist/idle-timer',
        'utils'           : 'utilities/utils',
        'helpers'         : 'utilities/helpers',
        'customselect'    : 'bower_components/jquery.customSelect/jquery.customSelect.amd',
        'dd'              : 'utilities/debug'
    },
    map: {
        '*': {
            'jquery': 'resources/jquery'
        },
        'resources/jquery': {
            'jquery': 'jquery'
        }
    },
    shim: {
        underscore: {
            exports: '_',
            /**
             * Make sure that the global '_' variable is removed form the scope
             * @return {underscore} Returns the underscore variable
             */
            init: function() {
                /* jshint strict: false */
                /* globals _ */
                return _.noConflict();
            }
        },
        idle: ['jquery'],
        customselect: ['jquery']
    },
    noGlobal: true
});