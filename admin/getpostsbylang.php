<?php

function get_posts_by_lang($args = array(), $lang = "fr") {
    global $wpdb;

    $post_table = $wpdb->posts;
    $translation_table = $wpdb->prefix . 'icl_translations';

    $sql = "
        SELECT ID
        FROM ".$post_table." wposts
        JOIN ".$translation_table." t ON wposts.ID = t.element_id 
        WHERE element_type = 'post_".$args['post_type']."' 
        AND language_code='".$lang."'  
    ";

    // Post status
    if(!empty($args['post_status'])) $sql .= " AND wposts.post_status = '".$args['post_status']."'";

    // Post type
    if(!empty($args['post_type'])) $sql .= " AND wposts.post_type = '".$args['post_type']."'";

    // Order By
    if(!empty($args['orderby']))
    {
        $sql .= " ORDER BY ".$args['orderby'];
        if(!empty($args['order'])) $sql .= " ".$args['order'];
    }

    // Limit 
    if(!empty($args['posts_per_page']))
    {
        $sql .= " LIMIT ".$args['posts_per_page'];
        if(!empty($args['offset'])) $sql .= " OFFSET ".$args['offset'];
    }
   
    $rows = $wpdb->get_results($sql, 'ARRAY_A');

    $posts = array();
    foreach ($rows as $post_id) {
        $posts[] = get_post($post_id['ID']);
    }

    return $posts;
}

