jQuery(window).load( function() {

	/* broken
	jQuery('#content_ifr').contents().find('#tinymce').on("keydown", "span.shortcodeblock", function (e) {
		console.log(1);
		console.log(e);
		//jQuery(this).remove();
	});

	jQuery('#content_ifr').contents().find('#tinymce').on("keydown", function (e) {
		var iframe = jQuery('#content_ifr').get(0);
		var doc = iframe.contentDocument || iframe.contentWindow.document;
		console.log(jQuery('#content_ifr').contents().find('*:focus').size());
		//jQuery(doc.activeElement).remove();

		//jQuery(":focus");
	});
	*/

	jQuery('#content_ifr').contents().find('#tinymce').on("click", "span.shortcodeblock", function () {
		var element = jQuery(this).get(0);
		SelectText(element);
	});

	jQuery('#content_ifr').contents().find('#tinymce').on("dblclick", "span.shortcodeblock", function () {
		SelectText(jQuery(this).get(0));
		jQuery("#isui_shortcode_button").trigger("click");
	});
});

function SelectText(element) {

	var iframe = jQuery('#content_ifr').get(0);
    var body = jQuery(element).parents("body").get(0);
    var doc = iframe.contentDocument || iframe.contentWindow.document;
	var win = iframe.contentWindow || iframe.contentDocument.defaultView;
    var range, selection;

    if (body.createTextRange) {
        range = body.createTextRange();
        range.moveToElementText(element);
        range.select();
    } else if (win.getSelection) {
        selection = win.getSelection();        
        range = doc.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}