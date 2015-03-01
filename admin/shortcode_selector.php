<?php
require( '../../../../wp-blog-header.php' );

if ( !current_user_can( 'author' ) && !current_user_can( 'editor' ) && !current_user_can( 'administrator' ) ){
	die( 'Access denied' );
}
$editor=(isset($_GET['editor']) && $_GET['editor']!='') ? $_GET['editor'] : 'text';


?>


<div id="isui_shortcode_selector">
	<input type="text" id="isui_shortcode_selector_filter" placeholder="<?php _e( 'Search', 'isui-shortcodes' ); ?>"><span class="clear_field"></span>
	<ul id="isui_shortcodes_list">
		<?php
		foreach ( shortcodes_list() as $name => $shortcode ) {
			if ( (!isset($shortcode['hidden']) || (isset($shortcode['hidden']) && $shortcode['hidden'] != '1' )) && !($editor=='dnd' && (isset($shortcode['hide_in_dnd']) && $shortcode['hide_in_dnd']))){
				$child_name = (!empty($shortcode['child'])) ? ' &rarr; ['.$shortcode['child'].']' : '';
				$description = (isset($shortcode['description'])) ? $shortcode['description'] : 'ddd';
				echo '<li class="isui_select_shortcode" data-shortcode="'.$name.'"><span class="item-title">' . $description . '</span><span class="item-info">[' . $name . ']'.$child_name.'</span></li>';
			}
		} ?>
	</ul>
</div>
<div id="isui_shortcode_attributes">
	<h3 id="isui_initial_title">Milacron Shortcodes</h3>
	<p id="isui_initial_message"><?php _e( 'Search or pick a shortcode from the list.<br><br>', 'isui-shortcodes');?></p>
	<p id="isui_initial_message_image"></p>
</div>

