<?php 



if (!function_exists('shortcodes_list')){
	function shortcodes_list( $shortcode = false ) {
		global $shortcodes_list;
		if ( $shortcode ){
			return $shortcodes_list[$shortcode];
		}
		else{
			ksort($shortcodes_list);
			return $shortcodes_list;
		}
	}
}


if (!function_exists('ISU_plugin_3rd_party')){
	function ISU_plugin_3rd_party() {
		global $shortcodes_list;
		$return = array();
		foreach($shortcodes_list as $shortcode => $att){
			if(isset($att['third_party']) && $att['third_party'] == 1){
				$return[] = $shortcode;
			}
		}
		$return = implode(',', $return);
		return $return;
	}
}


if (!function_exists('ISU_plugin_the_content_filter')){
	function ISU_plugin_the_content_filter($content) {
		foreach ( shortcodes_list() as $name => $shortcode ) {
			$shortcode_list[] = $name;
			$shortcode_list[] = str_replace('_dd', '_DD', $name);
		}
		$block = join("|", $shortcode_list);
		$rep = preg_replace("/(<p>)?\[($block)(\s[^\]]+)?\](<\/p>|<br \/>)?/","[$2$3]",$content);
		$rep = preg_replace("/(<p>)?\[\/($block)](<\/p>|<br \/>)?/","[/$2]",$rep);
		return $rep;
	}
}
add_filter("the_content", "ISU_plugin_the_content_filter");


if (!function_exists('ISU_plugin_shortcode_names')){
	function ISU_plugin_shortcode_names() {
		global $shortcodes_list;
		$return = array();
		foreach($shortcodes_list as $shortcode => $att){
			$return[$shortcode] = (isset($att['description'])) ? $att['description'] : '';
		}
		return $return;
	}
}


if (!function_exists('ISU_plugin_extract_attributes')){
	function ISU_plugin_extract_attributes ($shortcode) {
		foreach($GLOBALS['shortcodes_list'][$shortcode]['attributes'] as $att => $val){
			$defaults[$att] = (isset($val['default'])) ? $val['default'] : '';
		}
		return $defaults;
	}
}


if (!function_exists('ISU_plugin_current_page_url')){
	function ISU_plugin_current_page_url() {
		$pageURL = 'http';
		if( isset($_SERVER["HTTPS"]) ) {
			if ($_SERVER["HTTPS"] == "on") {$pageURL .= "s";}
		}
		$pageURL .= "://";
		if ($_SERVER["SERVER_PORT"] != "80") {
			$pageURL .= $_SERVER["SERVER_NAME"].":".$_SERVER["SERVER_PORT"].$_SERVER["REQUEST_URI"];
		} else {
			$pageURL .= $_SERVER["SERVER_NAME"].$_SERVER["REQUEST_URI"];
		}
		return $pageURL;
	}
}


if (!function_exists('ISU_plugin_get_current_post_type')){
	function ISU_plugin_get_current_post_type() {
	  global $post, $typenow, $current_screen;
	  //we have a post so we can just get the post type from that
	  if ( $post && $post->post_type )
	    return $post->post_type;
	  //check the global $typenow - set in admin.php
	  elseif( $typenow )
	    return $typenow;
	  //check the global $current_screen object - set in sceen.php
	  elseif( $current_screen && $current_screen->post_type )
	    return $current_screen->post_type;
	  //lastly check the post_type querystring
	  elseif( isset( $_REQUEST['post_type'] ) )
	    return sanitize_key( $_REQUEST['post_type'] );
	  //we do not know the post type!
	  return null;
	}
}

if (!function_exists('ISU_plugin_trim_excerpt_do_shortcode')){
	function ISU_plugin_trim_excerpt_do_shortcode($text) {
		$raw_excerpt = $text;
		if ( '' == $text ) {
			$text = get_the_content('');
			$text = do_shortcode( $text );
			$text = apply_filters('the_content', $text);
			$text = str_replace(']]>', ']]&gt;', $text);
			$text = strip_tags($text);
			$excerpt_length = apply_filters('excerpt_length', 55);
			$excerpt_more = apply_filters('excerpt_more', ' ' . '[...]');
			$words = preg_split("/[\n\r\t ]+/", $text, $excerpt_length + 1, PREG_SPLIT_NO_EMPTY);
			if ( count($words) > $excerpt_length ) {
				array_pop($words);
				$text = implode(' ', $words);
				$text = $text . $excerpt_more;
			} else {
				$text = implode(' ', $words);
			}
		}
		return apply_filters('wp_trim_excerpt', $text, $raw_excerpt);
	}
}
$options = get_option( 'isui_settings' );
$isui_excerpt = (isset($options['isui_excerpt']) && $options['isui_excerpt']==1) ? 1  : 0;
if($isui_excerpt){
	remove_filter('get_the_excerpt', 'wp_trim_excerpt');
	add_filter('get_the_excerpt', 'ISU_plugin_trim_excerpt_do_shortcode');
}


if ( ! function_exists( 'ISU_plugin_name_to_id' ) ){
	function ISU_plugin_name_to_id($name){
		$class = strtolower(str_replace(array(' ',',','.','"',"'",'/',"\\",'+','=',')','(','*','&','^','%','$','#','@','!','~','`','<','>','?','[',']','{','}','|',':',),'',$name));
		return $class;
	}
}