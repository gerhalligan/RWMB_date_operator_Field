jQuery(document).ready(function($){
    (function ($, rwmb) {
        'use strict';

        if (typeof rwmb !== 'undefined') {
            $('.rwmb_date_operator_json').each(function(){
                etrck_date_operator($(this));
            });

            $('.rwmb-clone .rwmb_date_operator_json').each(function(index){
                var cloneId = $(this).parent().find('input').attr('name');
                var groupId = cloneId.split('[')[0];
                etrck_group_date_operator($(this), cloneId, groupId, index);
            });

            if (typeof rwmb !== 'undefined' && rwmb.$document) {
                $(document).on('clone', function(events, index){
                    let cloneId = 0;
                    const clone = events.target;
                    const cloneClass = clone.className;

                    if (cloneClass === 'rwmb-date_operator rwmb-text') {
                        cloneId = clone.id; //date_operator_{random_number-letters}
                        //get the parent group id
                        var groupId = $('#' + cloneId).attr('name');
                        groupId = groupId.split('[')[0]; // get group_id from group_id[index][cloneId]
                    }
                    $('.rwmb-clone .rwmb_date_operator_json').each(function(){
                        etrck_group_date_operator($(this), cloneId, groupId, index);
                    });
                });
            }
        } else {
            console.error('rwmb is not defined');
        }
    })(jQuery, window.rwmb || {});

    function etrck_date_operator(object){
        //get the operator field id from data-operatorfield attribute
        var operatorField = object.data('operatorfield');

        //get the date format
        var dateFormat = object.data('dateformat');

        //get the operator field value
        var operatorFieldValue = jQuery('#' + operatorField).val();

        //if the operator field is empty, set it to 0
        if (operatorFieldValue === '') {
            jQuery('#' + operatorField).val(0);
        }

        //get the ids that we will apply the formula to, from the data-jsoptions attribute
        var ids = object.data('jsoptions');
        ids = ids.fields_id;

        //get the second date
        var secondDate = object.data('jsoptions').second_date;

        //join with [name=] to get the radio and checkbox fields
        var idsWithNames = [];
        jQuery.each(ids, function (i, id){
            idsWithNames.push('[name*=' + id + ']');
        });

        //also include the second date field in the event listener
        if (secondDate && secondDate.match(/^\d{4}-\d{2}-\d{2}$/) === null) {
            idsWithNames.push('[name*="' + secondDate + '"]');
        }

        //console.log('etrck_date_operator: ' + idsWithNames.join(','));

        //everytime the value of the ids fields or second date field changes, apply the formula
       jQuery(document).on('change input', idsWithNames.join(','), function() {
            var $group = jQuery(this).closest('.rwmb-group-wrapper'); // Adjust the class name to match the group wrapper
            
            // Get the operator field value within the group
            var operatorFieldValue = $group.find('[name*="' + operatorField + '"]').val();
            // If the operator field is empty, set it to 0
            if (operatorFieldValue === '') {
                $group.find('[name*="' + operatorField + '"]').val(0);
            }

            // Get the value of the first date field within the group
            var firstDateValue = $group.find('[name*="' + ids[0] + '"]').val();

            // Get the value of the second date within the group
            var secondDateValue = secondDate;
            if (secondDate === '') {
                secondDateValue = moment().format('YYYY-MM-DD');
            } else if (secondDate.match(/^\d{4}-\d{2}-\d{2}$/) === null) {
                secondDateValue = $group.find('[name*="' + secondDate + '"]').val();
            }

            // Check if secondDateValue is still empty and set it to today's date if it is
            if (secondDateValue === '') {
                secondDateValue = moment().format('YYYY-MM-DD');
            }

            // Calculate the difference
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

            // Evaluate the formula and handle potential infinity results
            if (diff === Infinity) {
                $group.find('[name*="' + operatorField + '"]').val(0);
            } else {
                $group.find('[name*="' + operatorField + '"]').val(diff.toFixed(2)).trigger('change');
            }
        });

    }

    //MB GROUPS, based on the function above
    function etrck_group_date_operator(object, cloneId, groupId, index) {
        if (!index) {
            etrck_date_operator(object);
        }

        // Get the operator field id from data-operatorfield attribute
        var operatorField = object.data('operatorfield');
        operatorField = groupId + '[' + index + '][' + operatorField + ']'; // Name of the newly cloned field

        // Get the date format
        var dateFormat = object.data('dateformat');

        // Get the ids that we will apply the formula to, from the data-jsoptions attribute
        var ids = object.data('jsoptions').fields_id;

        // Get the second date
        var secondDate = object.data('jsoptions').second_date;

        // Join with [name=] to get the radio and checkbox fields
        var idsWithNames = [];
        jQuery.each(ids, function (i, id) {
            var fieldName = groupId + '[' + index + '][' + id + ']';
            idsWithNames.push('[name*="' + fieldName + '"]');
        });

        // Also include the second date field in the event listener
        if (secondDate && secondDate.match(/^\d{4}-\d{2}-\d{2}$/) === null) {
            var secondDateFieldName = groupId + '[' + index + '][' + secondDate + ']';
            idsWithNames.push('[name*="' + secondDateFieldName + '"]');
        }

        // Every time the value of the ids fields or second date field changes, apply the formula
        jQuery(document).on('change input', idsWithNames.join(','), function () {
            console.log('group changed');

            // Get the operator field value
            var operatorFieldValue = jQuery('[name*="' + operatorField + '"]').val();
            // If the operator field is empty, set it to 0
            if (operatorFieldValue === '') {
                jQuery('[name*="' + operatorField + '"]').val(0);
            }

            // Get the value of the first date field
            var firstDateFieldName = groupId + '[' + index + '][' + ids[0] + ']';
            var firstDateValue = jQuery('[name*="' + firstDateFieldName + '"]').val();

            // Get the value of the second date
            var secondDateValue = secondDate;
            if (secondDate === '') {
                secondDateValue = moment().format('YYYY-MM-DD');
            } else if (secondDate.match(/^\d{4}-\d{2}-\d{2}$/) === null) {
                var secondDateFieldName = groupId + '[' + index + '][' + secondDate + ']';
                secondDateValue = jQuery('[name*="' + secondDateFieldName + '"]').val();
            }

            // Check if secondDateValue is still empty and set it to today's date if it is
            if (secondDateValue === '') {
                secondDateValue = moment().format('YYYY-MM-DD');
            }

            // Calculate the difference
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

            // Evaluate the formula and handle potential infinity results
            if (diff === Infinity) {
                jQuery('[name*="' + operatorField + '"]').val(0);
            } else {
                jQuery('[name*="' + operatorField + '"]').val(diff.toFixed(2)).trigger('change');
            }
        });
    }


});
