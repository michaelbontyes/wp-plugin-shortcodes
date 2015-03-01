<?php 

function ISU_plugin_enqueue_admin_scripts($hook) {

	$options = get_option( 'isui_settings' );
	$isui_disable_on = (isset($options['isui_disable_on'])) ? explode(',', $options['isui_disable_on'])  : array();
	$isui_disable_on = array_map('trim',$isui_disable_on);

	if(in_array(ISU_plugin_get_current_post_type(), $isui_disable_on)){
		return;
	}
	
	if(($hook != 'post.php' && $hook != 'post-new.php')){
		return;
	}
	
	wp_enqueue_style('thickbox');
	wp_enqueue_style('wp-color-picker');
	wp_enqueue_style('milacron-shortcodes-fancybox', SHORTCODES_DIR.'css/jquery.fancybox-1.3.4.css', array());
	wp_enqueue_style('isui-cleditor', SHORTCODES_DIR.'cleditor/jquery.cleditor.css', array());
	wp_enqueue_style('milacron-shortcodes-mCustomScrollbar', SHORTCODES_DIR.'css/jquery.mCustomScrollbar.css', array());
	wp_enqueue_style('milacron-shortcodes-ddtab', SHORTCODES_DIR.'css/ddtab.css', array());
	wp_enqueue_media();
	wp_enqueue_script('thickbox');
	wp_enqueue_script('milacron-shortcodes-fancybox', SHORTCODES_DIR.'js/jquery.fancybox-1.3.4.js', array('jquery'));
	wp_enqueue_script('isui-cleditor', SHORTCODES_DIR.'cleditor/jquery.cleditor.min.js', array('jquery'));
	wp_enqueue_script('milacron-shortcodes-mousewheel', SHORTCODES_DIR.'js/jquery.mousewheel.js', array('jquery'));
	wp_enqueue_script('milacron-shortcodes-mCustomScrollbar', SHORTCODES_DIR.'js/jquery.mCustomScrollbar.js', array('jquery','milacron-shortcodes-mousewheel'));
	wp_enqueue_script('milacron-shortcodes-cookie', SHORTCODES_DIR.'js/jquery.cookie.js', array('jquery'));
	wp_enqueue_script('milacron-shortcodes-ddtab', SHORTCODES_DIR.'js/ddtab.js', array('milacron-shortcodes-mCustomScrollbar', 'isui-cleditor', 'wp-color-picker','jquery-ui-sortable','jquery-ui-resizable','milacron-shortcodes-fancybox'),true);
	
	wp_enqueue_style('bt-select2css', SHORTCODES_DIR.'css/select2-bootstrap.css');
	wp_enqueue_style('select2css', SHORTCODES_DIR.'css/select2.css');
	wp_enqueue_script('select2js', SHORTCODES_DIR.'js/select2.min.js');

	wp_localize_script('milacron-shortcodes-ddtab', 'isui_from_WP', array(
		'plugins_url' => plugins_url('milacron-shortcodes'),
		'ISU_plugin_shortcode_names' => ISU_plugin_shortcode_names(),
		'ISU_plugin_3rd_party' => ISU_plugin_3rd_party(),
		'saved_layouts' => implode("|", array_keys(get_option('isui_shortcodes_layouts',array()))),
		'save' => __('Save', 'milacron-shortcodes'),
		'error_to_editor' => __('<b>Content cannot be parsed</b><br>Please use Text tab instead or Revisions option to undo recently made changes.<br><br>Check the syntax:<br>- Use double quotes for attributes<br>- Every shortcode must be closed. e.g. [gallery ids="1,20"] should be [gallery ids="1,20"][/gallery]', 'milacron-shortcodes'),
		'delete_section' => __('Delete Section', 'milacron-shortcodes'),
		'duplicate_section' => __('Duplicate Section', 'milacron-shortcodes'),
		'edit_section' => __('Edit Section', 'milacron-shortcodes'),
		'remove_column' => __('Remove Column', 'milacron-shortcodes'),
		'add_column' => __('Add Column', 'milacron-shortcodes'),
		'add_element' => __('Add Element', 'milacron-shortcodes'),
		'edit_column' => __('Edit Column', 'milacron-shortcodes'),
		'text' => __('Text', 'milacron-shortcodes'),
		'delete_element' => __('Delete Element', 'milacron-shortcodes'),
		'duplicate_element' => __('Duplicate Element', 'milacron-shortcodes'),
		'edit_element' => __('Edit Element', 'milacron-shortcodes'),
		'drag_and_drop' => __('Drag & Drop', 'milacron-shortcodes'),
		'add_edit_shortcode' => __('Add a Shortcode', 'milacron-shortcodes'),
		'add_section' => __('Add Section', 'milacron-shortcodes'),
		'layout_save' => __('Save Layout', 'milacron-shortcodes'),
		'layout_delete' => __('Delete Layout', 'milacron-shortcodes'),
		'layout_name' => __('Enter layout name', 'milacron-shortcodes'),
		'layout_name_delete' => __('Layout name to delete', 'milacron-shortcodes'),
		'layout_saved' => __('Layout successfully saved', 'milacron-shortcodes'),
		'layout_select_saved_first' => __('Select saved layout to load', 'milacron-shortcodes'),
		'layout_select_saved_second' => __('or', 'milacron-shortcodes'),
		'rearange_sections' => __('Rearange Sections', 'milacron-shortcodes'),
		'are_you_sure' => __('Are you sure?', 'milacron-shortcodes'),
		'custom_column_class' => __('Custom Column Class', 'milacron-shortcodes'),
		'animation' => __('Animation', 'milacron-shortcodes'),
		'none' => __('None', 'milacron-shortcodes'),
		'animation_duration' => __('Animation Duration ms', 'milacron-shortcodes'),
		'animation_delay' => __('Animation Delay ms', 'milacron-shortcodes'),
		'custom_section_class' => __('Custom Section Class', 'milacron-shortcodes'),
		'fullwidth' => __('Fullwidth Content', 'milacron-shortcodes'),
		'video_bg' => __('Video Background', 'milacron-shortcodes'),
		'video_bg_info' => __('If checked video background will be enabled. Video files should have same name as Background Image, and same path, only different extensions (mp4,webm,ogv files required). You can use Miro Converter to convert files in required formats.', 'milacron-shortcodes'),
		'background_color' => __('Background Color', 'milacron-shortcodes'),
		'background_image' => __('Background Image URL', 'milacron-shortcodes'),
		'parallax' => __('Background Parallax Factor', 'milacron-shortcodes'),
		'parallax_info' => __('0.1 means 10% of scroll, 2 means twice of scroll', 'milacron-shortcodes'),
		'flip' => __( 'Flip', 'milacron-shortcodes' ),
		'flipInX' => __( 'Flip In X', 'milacron-shortcodes' ),
		'flipInY' => __( 'Flip In Y', 'milacron-shortcodes' ),
		'fadeIn' => __( 'Fade In', 'milacron-shortcodes' ),
		'fadeInUp' => __( 'Fade In Up', 'milacron-shortcodes' ),
		'fadeInDown' => __( 'Fade In Down', 'milacron-shortcodes' ),
		'fadeInLeft' => __( 'Fade In Left', 'milacron-shortcodes' ),
		'fadeInRight' => __( 'Fade In Right', 'milacron-shortcodes' ),
		'fadeInUpBig' => __( 'Fade In Up Big', 'milacron-shortcodes' ),
		'fadeInDownBig' => __( 'Fade In Down Big', 'milacron-shortcodes' ),
		'fadeInLeftBig' => __( 'Fade In Left Big', 'milacron-shortcodes' ),
		'fadeInRightBig' => __( 'Fade In Right Big', 'milacron-shortcodes' ),
		'slideInLeft' => __( 'Slide In Left', 'milacron-shortcodes' ),
		'slideInRight' => __( 'Slide In Right', 'milacron-shortcodes' ),
		'bounceIn' => __( 'Bounce In', 'milacron-shortcodes' ),
		'bounceInDown' => __( 'Bounce In Down', 'milacron-shortcodes' ),
		'bounceInUp' => __( 'Bounce In Up', 'milacron-shortcodes' ),
		'bounceInLeft' => __( 'Bounce In Left', 'milacron-shortcodes' ),
		'bounceInRight' => __( 'Bounce In Right', 'milacron-shortcodes' ),
		'rotateIn' => __( 'Rotate In', 'milacron-shortcodes' ),
		'rotateInDownLeft' => __( 'Rotate In Down Left', 'milacron-shortcodes' ),
		'rotateInDownRight' => __( 'Rotate In Down Right', 'milacron-shortcodes' ),
		'rotateInUpLeft' => __( 'Rotate In Up Left', 'milacron-shortcodes' ),
		'rotateInUpRight' => __( 'Rotate In Up Right', 'milacron-shortcodes' ),
		'lightSpeedIn' => __( 'Light Speed In', 'milacron-shortcodes' ),
		'rollIn' => __( 'Roll In', 'milacron-shortcodes' ),
		'flash' => __( 'Flash', 'milacron-shortcodes' ),
		'bounce' => __( 'Bounce', 'milacron-shortcodes' ),
		'shake' => __( 'Shake', 'milacron-shortcodes' ),
		'tada' => __( 'Tada', 'milacron-shortcodes' ),
		'swing' => __( 'Swing', 'milacron-shortcodes' ),
		'wobble' => __( 'Wobble', 'milacron-shortcodes' ),
		'pulse' => __( 'Pulse', 'milacron-shortcodes' ),
		'upload_image' => __( 'Upload Image', 'milacron-shortcodes' ),
		'choose_image' => __( 'Choose Image', 'milacron-shortcodes' ),
		'use_image' => __( 'Use Image', 'milacron-shortcodes' ),
		'section_title' => __( 'Section Title', 'milacron-shortcodes' ),
		'section_id' => __( 'Section ID', 'milacron-shortcodes' ),
		'section_intro' => __( 'Section Intro', 'milacron-shortcodes' ),
		'section_outro' => __( 'Section Outro', 'milacron-shortcodes' ),
	));
}
add_action( 'admin_enqueue_scripts', 'ISU_plugin_enqueue_admin_scripts' );



function ISU_plugin_enqueue_frontend_script() {

	wp_enqueue_style('wp-mediaelement');
	
	wp_enqueue_style('isui_icons_default', SHORTCODES_DIR.'css/icons-default.css', array());

	$options = get_option( 'isui_settings' );
	if(isset($options['isui_enable_fa']) && $options['isui_enable_fa']==1){
		wp_enqueue_style('isui_icons_fa', SHORTCODES_DIR.'css/icons-fa.css', array());
	}
	if(isset($options['isui_enable_whhg']) && $options['isui_enable_whhg']==1){
		wp_enqueue_style('isui_icons_whhg', SHORTCODES_DIR.'css/icons-whhg.css', array());
	}
	
	wp_enqueue_style('isui_plugin__animo-animate', SHORTCODES_DIR.'css/animo-animate.css', array());
	wp_enqueue_style('isui_plugin__prettify', SHORTCODES_DIR.'css/prettify.css', array());
	if(is_file(get_stylesheet_directory().'/css/milacron-shortcodes.css')){
		wp_enqueue_style('isui_plugin__shortcodes', get_stylesheet_directory_uri().'/css/milacron-shortcodes.css', array('isui_plugin__animo-animate', 'isui_plugin__prettify'));
	}
	else{
		wp_enqueue_style('isui_plugin__shortcodes', SHORTCODES_DIR.'css/shortcodes-default.css', array('isui_plugin__animo-animate', 'isui_plugin__prettify'));
	}
	wp_enqueue_style('isui_plugin__shortcodes_responsive', SHORTCODES_DIR.'css/responsive.css', array('isui_plugin__shortcodes'));
	wp_enqueue_script('wp-mediaelement');


	$options = get_option( 'isui_settings' );
	$isui_tipsy_opacity = (isset($options['isui_tipsy_opacity'])) ? $options['isui_tipsy_opacity'] : '0.8';

	wp_enqueue_script('milacron-shortcodes', SHORTCODES_DIR.'js/init.js', array('jquery', 'jquery-ui-accordion', 'jquery-ui-tabs', 'jquery-effects-slide', 'animo', 'google_maps_jquery', 'parallax', 'inview' , 'tipsy' , 'knob' , 'prettify'), true);
	wp_localize_script( 'milacron-shortcodes', 'isui_options', array( 
		'isui_tipsy_opacity' => $isui_tipsy_opacity, 
	) );
}
add_action( 'wp_enqueue_scripts', 'ISU_plugin_enqueue_frontend_script' );

