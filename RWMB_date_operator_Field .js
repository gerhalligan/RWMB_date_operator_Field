jQuery(document).ready(function($){
    (function ( $, rwmb ) {
        'use strict';

        if (typeof rwmb !== 'undefined') {
            $('.rwmb_date_operator_json').each(function(){
                etrck_date_operator($(this));
            });

            $('.rwmb-clone .rwmb_date_operator_json').each(function( index ){
                var cloneId = $(this).parent().find('input').attr('name');
                var groupId = cloneId.split('[')[0];
                etrck_group_date_operator($(this), cloneId, groupId, index);
            });

            $(document).on('clone', function(events, index){
                let cloneId = 0;
                const clone = events.target;
                const cloneClass = clone.className;

                if( cloneClass === 'rwmb-date_operator rwmb-text' ){
                    cloneId = clone.id; //date_operator_{random_number-letters}
                    //get the parent group id
                    var groupId = $('#'+cloneId).attr('name');
                    groupId = groupId.split('[')[0]; // get group_id from group_id[index][cloneId]
                }
                $('.rwmb-clone .rwmb_date_operator_json').each(function(){
                    etrck_group_date_operator($(this), cloneId, groupId, index);
                });
            });
        } else {
            console.error('rwmb is not defined');
        }
    })( jQuery, window.rwmb || {} );
});

function etrck_date_operator(object){
    //get the operator field id from data-operatorfield attribute
    var operatorField = object.data('operatorfield');

    //get the date format
    var dateFormat = object.data('dateformat');

    //get the operator field value
    var operatorFieldValue = jQuery('#'+operatorField).val();

    //if the operator field is empty, set it to 0
    if(operatorFieldValue === ''){
        jQuery('#'+operatorField).val(0);
    }

    //get the ids that we will apply the formula to, from the data-jsoptions attribute
    var ids = object.data('jsoptions');
    ids = ids.fields_id;

    //get the second date
    var secondDate = object.data('jsoptions').second_date;

    //join with [name=] to get the radio and checkbox fields
    var idsWithNames = [];
    jQuery.each(ids, function(i, id){
        idsWithNames.push('[name*='+id+']');
    });

    //console.log('etrck_date_operator: ' + idsWithNames.join(','));

    //everytime the value of the ids fields changes, apply the formula
    jQuery(document).on('change input', idsWithNames.join(','), ids, function() {
        //get the operator field value
        var operatorFieldValue = jQuery('#'+operatorField).val();
        //if the operator field is empty, set it to 0
        if(operatorFieldValue === ''){
            jQuery('#'+operatorField).val(0);
        }

        //get the value of the ids fields
        var firstDateValue = jQuery('[name*="'+ids[0]+'"]').val();

        //get the value of the second date
        var secondDateValue = secondDate;
        if(secondDate === ''){
            secondDateValue = moment().format('YYYY-MM-DD');
        } else if (secondDate.match(/^\d{4}-\d{2}-\d{2}$/) === null) {
            secondDateValue = jQuery('[name*="'+secondDate+'"]').val();
        }

        //calculate the difference
        var diff = 0;
        var firstDate = moment(firstDateValue, 'YYYY-MM-DD');
        var secondDateMoment = moment(secondDateValue, 'YYYY-MM-DD');

        if(dateFormat === 'years'){
            diff = secondDateMoment.diff(firstDate, 'years', true);
        } else if(dateFormat === 'months'){
            diff = secondDateMoment.diff(firstDate, 'months', true);
        } else {
            diff = secondDateMoment.diff(firstDate, 'days', true);
        }

        jQuery('#'+operatorField).val(diff.toFixed(2)).trigger('change');
    });
}

//MB GROUPS, based on the function above
function etrck_group_date_operator(object, cloneId, groupId, index){

    if(!index){
        etrck_date_operator(object);
    }

    //get the operator field id from data-operatorfield attribute
    var operatorField = object.data('operatorfield');

    operatorField = groupId+'\\['+index+'\\]\\['+operatorField+'\\]'; //name of the newly cloned field

    //get the date format
    var dateFormat = object.data('dateformat');

    //get the operator field value
    var operatorFieldValue = jQuery('[name="'+operatorField +'"]').val();

    //if the operator field is empty, set it to 0
    if(operatorFieldValue === ''){
        jQuery('[name="'+operatorField +'"]').val(0);
    }

    //get the ids that we will apply the formula to, from the data-jsoptions attribute, and convert them to the new format
    var ids = object.data('jsoptions');
    ids = ids.fields_id;

    //get the second date
    var secondDate = object.data('jsoptions').second_date;

    //join with [name=] to get the radio and checkbox fields
    var idsWithNames = [];
    jQuery.each(ids, function(i, id){
        idsWithNames.push('[name*="'+groupId+'\\['+index+'\\]\\['+id+'\\]"]');
    });

    //get the id of each idsWithNames
    var idsWithNamesIds = [];
    jQuery.each(idsWithNames, function(i, id){
        idsWithNamesIds.push(jQuery(id).attr('id'));
    });

    //everytime the value of the ids fields changes, apply the formula
    jQuery(document).ready(function($) {
        jQuery(document).on('change input', idsWithNames.join(','), function() {
            console.log('group changed');
            var $closestParent = $(this).closest('.rwmb-clone.rwmb-group-clone.rwmb-sort-clone');
            var operatorFieldValue = $closestParent.find('[name="' + operatorField + '"]').val();
            if (operatorFieldValue === '') {
                $closestParent.find('[name="' + operatorField + '"]').val(0);
            }

            var firstDateValue = $closestParent.find('[name*="' + ids[0] + '"]').val();
            var secondDateValue = secondDate;
            if (secondDate === '') {
                secondDateValue = moment().format('YYYY-MM-DD');
            } else if (secondDate.match(/^\d{4}-\d{2}-\d{2}$/) === null) {
                secondDateValue = $closestParent.find('[name*="' + secondDate + '"]').val();
            }

            var diff = 0;
            var firstDate = moment(firstDateValue, 'YYYY-MM-DD');
            var secondDateMoment = moment(secondDateValue, 'YYYY-MM-DD');

            if (dateFormat === 'years') {
                diff = secondDateMoment.diff(firstDate, 'years', true);
            } else if (dateFormat === 'months') {
                diff = secondDateMoment.diff(firstDate, 'months', true);
            } else {
                diff = secondDateMoment.diff(firstDate, 'days', true);
            }

            $closestParent.find('[name="' + operatorField + '"]').val(diff.toFixed(2)).trigger('change');
        });
    });
}
