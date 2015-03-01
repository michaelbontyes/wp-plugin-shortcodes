<?php
/*
Plugin Name: Wordpress Plugin Shortcodes
Description: Wordpress Plugin to implement shortcodes
Author: Michael Bontyes
Version: 1.0
*/
// print_r('start | ');

define('SHORTCODES_DIR', plugin_dir_url( __FILE__ ));

global $shortcodes_list;
$shortcodes_list = array();


require_once 'admin/functions.php';
require_once 'admin/enqueue_scripts.php';
require_once 'admin/getpostsbylang.php';

// Get Pages List
global $post;

$page_list = array();

$args = array(
'posts_per_page'   => 9000,
'offset'           => 0,
'orderby'          => 'post_title',
'order'            => 'ASC',
'post_type'        => 'page',
'post_status'      => 'publish',
'suppress_filters' => true
);


$pages = get_posts_by_lang($args, 'en');
$pages_list['The Current Page'] = 'The Current Page';
foreach ( $pages as $page )
{
	$name = $page->post_title;
	$id = $page->ID;
	$pages_list[$name] = $name.' - '.$id;
}




/* Include shortcodes form plugin or theme (if overridden) */
$shortcodes_dir = dirname( __FILE__ ) . '/shortcodes';
$files = preg_grep('/^([^.])/', scandir($shortcodes_dir));
foreach($files as $file) {

	include_once (dirname( __FILE__ ) . '/shortcodes/'.$file);
}




//filter in shortcode html on edit open
function shortcode_htmlwrapper_add ($content) {
	
	$content = preg_replace('%\[(.*)\]\s*(.*)\s*\[/(.*)\]%sU', '<span class="shortcodeblock $3">[$1]$2[/$3]</span>&nbsp;', $content);

	return $content;
}
add_filter( 'the_editor_content', 'shortcode_htmlwrapper_add' );

//filter out shortcode html before post save
function shortcode_htmlwrapper_removal ($content) {
	
	$content = preg_replace('%<span[^>]*>\s*(.*)\s*</span>%sU', '$1', $content);

	return $content;
}
add_filter( 'content_save_pre', 'shortcode_htmlwrapper_removal' );

// Add custom CTA styles to TinyMCE editor
if ( ! function_exists('shortcode_tinymce_css') ) {
	function shortcode_tinymce_css($wp) {
		$wp .= ',' . plugin_dir_url( __FILE__ ) . '/css/tinymce.css';
		return $wp;
	}
}
add_filter( 'mce_css', 'shortcode_tinymce_css' );

if ( ! function_exists('shortcode_wp_tiny_mce') ) {
	function shortcode_wp_tiny_mce() {
	    printf( '<script type="text/javascript" src="%s"></script>',  plugins_url('/js/tinymce.js', __FILE__) );
	}
}
add_action( 'after_wp_tiny_mce', 'shortcode_wp_tiny_mce' );

function translatedPage_byName($name) {
   $page = get_page_by_title($name);
   $page_translated = get_post( icl_object_id($page->ID, 'page', false,ICL_LANGUAGE_CODE) );
   return $page_translated;
}

function get_default_language_id($id) {
	// get the post ID in en
	global $sitepress;
	$default_post_id = icl_object_id($id, 'page', true, $sitepress->get_default_language());
	// get the post object
	$default_post_obj = get_post( $default_post_id);

	return $default_post_obj;
}


function getExcerpt($str, $startPos=0, $maxLength=120) {
	if(strlen($str) > $maxLength) {
		$excerpt   = substr($str, $startPos, $maxLength-3);
		$lastSpace = strrpos($excerpt, ' ');
		$excerpt   = substr($excerpt, 0, $lastSpace);
	} else {
		$excerpt = $str;
	}
	
	return $excerpt;
}