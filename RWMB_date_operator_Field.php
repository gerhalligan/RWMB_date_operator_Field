<?php 

/*
Summary
The RWMB_date_operator_Field extension for the Meta Box plugin allows users to create a custom field that calculates the difference between two dates. This difference can be expressed in years, months, or days. The field supports dynamic dates, where one or both dates can be sourced from other fields, set to a static date, or use the current date. This extension is useful for scenarios such as calculating age, duration, or time intervals within a custom meta box.

Features
Date Difference Calculation: Calculate the difference between two dates in years, months, or days.
Dynamic Date Sources: Use field IDs to reference other date fields, set a static date, or use the current date.
Customizable Output Format: Choose between years, months, or days for the date difference calculation.
Integration with Meta Box Builder: Easily add and configure this field type using the Meta Box Builder interface.
Usage Instructions
Installation
1. Include the PHP Class
Add the RWMB_date_operator_Field class definition to your theme or plugin.
2. Enqueue JavaScript Dependencies
Ensure that the moment.js library is enqueued. This can be done within the add_actions method of the class as shown above.

3. Add to Meta Box Builder
-Use the Meta Box Builder to add the date_operator field type to your custom meta boxes. Configure the field options such as id_to_calc_date, second_date, and date_format as needed.

Example Configuration
Here is an example of how to configure the date_operator field in the Meta Box Builder:

- Field ID for the first date: start_date
- Second Date: end_date (this could be another field ID, a static date like 2024-12-31, or leave empty to use the current date)
- Date Format: days (options: years, months, days)

This configuration will calculate the difference in days between the dates in the start_date and end_date fields and display the result in the read-only date_operator field.

Conclusion
The RWMB_date_operator_Field extension is a powerful tool for calculating date differences within your custom meta boxes, providing flexibility and ease of use through dynamic date sources and customizable output formats. Integrate it into your Meta Box setups to enhance date-related functionalities in your WordPress site.
*/

class RWMB_date_operator_Field extends RWMB_Field{

    public static function html( $meta, $field )
    {
        $id_to_calc_date = isset($field['id_to_calc_date']) ? $field['id_to_calc_date'] : '';
        $second_date = isset($field['second_date']) ? $field['second_date'] : '';
        $date_format = isset($field['date_format']) ? $field['date_format'] : 'days'; // default to 'days' if not set

        return sprintf(
            '<input type="text" name="%s" id="%s" class="rwmb-date_operator rwmb-text" readonly value="%s">
<script type="text/html" class="rwmb_date_operator_json" data-jsoptions="%s" data-operatorfield="%s" data-dateformat="%s"></script>',
            $field['field_name'],
            $field['id'],
            $meta,
            esc_attr( wp_json_encode( [ "fields_id" =>  explode(',', $id_to_calc_date ), "second_date" => $second_date ] ) ),
            $field['id'],
            $date_format
        );
    }

    public static function add_actions()
    {
        wp_enqueue_script('moment_js', 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js', ['jquery'], uniqid(), true );
        wp_enqueue_script('rwmb');
    }

    public static function get_theme_file_url($relative_path) {
        return get_stylesheet_directory_uri() . $relative_path;
    }
}

add_filter( 'mbb_field_types', function ( $field_types ) {
    $field_types['date_operator'] = [
        'title'    => __( 'Date Difference', 'earlytrack' ),
        'category' => 'advanced',
        'controls' => [
            'name', 'id', 'type', 'label_description', 'desc',
            \MBB\Control::Input( 'id_to_calc_date', [
                'label'   => __( 'Field ID for the first date', 'earlytrack' ),
                'tooltip' => __('Enter the field ID for the first date.', 'earlytrack'),
                'required'    => true,
            ], [] ),
            \MBB\Control::Input( 'second_date', [
                'label'   => __( 'Second Date', 'earlytrack' ),
                'tooltip' => __('Enter another field ID, a static date (YYYY-MM-DD), or leave empty to use the current date.', 'earlytrack'),
                'required'    => false,
            ], [] ),
            \MBB\Control::Select( 'date_format', [
                'label'   => __( 'Date Format', 'earlytrack' ),
                'tooltip' => __('Choose the format for the dates.', 'earlytrack'),
                'options' => [
                    'years' => __( 'Years', 'earlytrack' ),
                    'months' => __( 'Months', 'earlytrack' ),
                    'days' => __( 'Days', 'earlytrack' ),
                ],
                'required'    => true,
            ], [] ),
            'before', 'after', 'class', 'save_field', 'sanitize_callback', 'attributes', 'custom_settings','validation'
        ],
    ];

    return $field_types;
} );
