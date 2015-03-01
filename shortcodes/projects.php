<?php

/*********** Shortcode: Display Projects ************************************************************/

$shortcodes_list['projects'] = array(
	'description' => __('Display Projects Posts', 'isui-shortcodes' )
);

function display_projects(){

	// GET PROJECTS POSTS
	$args = array(
		'post_type' => 'projects',
		'post_status' => 'publish',
		'posts_per_page'   => -1,
	);
    $projects = get_posts( $args );

    // DISPLAY
	ob_start();

    foreach ($projects as $project) { ?>
    	
		<li class="bullet three-col-bullet">
			<div class="bullet-icon bullet-icon-1"><img src="https://raw.githubusercontent.com/thoughtbot/refills/master/source/images/placeholder_logo_2.png " alt="" /></div>
			<div class="bullet-content">
			<h2><?php echo get_title(); ?></h2>
			<?php echo get_field('excerpt'); ?>
			</div>
		</li>
		
    <?php }

    $output = '<ul class="bullets">'. ob_get_clean() .'</ul>';
	
	return	$output;
}

add_shortcode( 'display-projects', 'display_projects' );
