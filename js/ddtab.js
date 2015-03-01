jQuery(document).ready(function($) {
    "use strict";

    

    function isui_activate_dd(){
        $("#wp-content-editor-container").hide();
        $dd_tab_content.show();
        $dd_shortcode_button.hide();
        dom.removeClass('wp-content-wrap', 'html-active');
        dom.removeClass('wp-content-wrap', 'tmce-active');
        $dd_tab.addClass('active');
        $.cookie('isui_isui_activated', 'activated', { path: '/' });
        isui_generate_from_editor();
    }


    function isui_make_elements_sortable(){
        $( ".isui_column" ).sortable({
            connectWith: ".isui_column",
            items: "> .isui_element",
            revert: true,
            tolerance: "pointer",
            placeholder: "isui_element_placeholder",
            forcePlaceholderSize: true,
            stop: function(){
                isui_rebuild_widths();
                isui_write_to_editor();
            },
            over: isui_rebuild_widths
        }).disableSelection();
    }


    function isui_make_elements_resizable(){
        $('.isui_column').not( ':last-child' ).resizable({
            handles: "e", 
            containment: "parent",
            start: function( event, ui ) {
                var maxWidth = ui.element.width() + ui.element.next().width()-10;
                ui.element.resizable({maxWidth: maxWidth});
                $('.isui_column').each(function(){
                    var item_width = $(this).width();
                    $(this).data("initial_width", item_width);
                });
            },
            resize: function( event, ui ) {
                isui_resize_others(ui.element, ui.originalSize.width - ui.size.width);
                isui_columns_spans(ui.element.parent());
            },
            stop: function( event, ui ) {
                isui_write_to_editor();
            }
        }).on('resize', function (e) {
            e.stopPropagation();
        });
    }


    function isui_write_to_editor(){
        if($dd_tab_content.hasClass('syntax_error')){
            return;
        }
        var output='';
        var counter=0;
        $dd_tab_content.find('.isui_content_section').each(function(){
            if(counter>0){
                output += '\r\n\r\n';
            }
            counter++;
            output += '[section_dd';
            output += ($(this).data('fullwidth')!==undefined && $(this).data('fullwidth')!=='' ) ? ' fullwidth="'+$(this).data('fullwidth')+'"' : '';
            output += ($(this).data('video_bg')!==undefined && $(this).data('video_bg')!=='' ) ? ' video_bg="'+$(this).data('video_bg')+'"' : '';
            output += ($(this).data('bg_color')!==undefined && $(this).data('bg_color')!=='' ) ? ' bg_color="'+$(this).data('bg_color')+'"' : '';
            output += ($(this).data('bg_image')!==undefined && $(this).data('bg_image')!=='' ) ? ' bg_image="'+$(this).data('bg_image')+'"' : '';
            output += ($(this).data('parallax')!==undefined && $(this).data('parallax')!=='' ) ? ' parallax="'+$(this).data('parallax')+'"' : '';
            output += ($(this).data('section_title')!==undefined && $(this).data('section_title')!=='' ) ? ' section_title="'+$(this).data('section_title')+'"' : '';
            output += ($(this).data('section_id')!==undefined && $(this).data('section_id')!=='' ) ? ' section_id="'+$(this).data('section_id')+'"' : '';
            output += ($(this).data('section_intro')!==undefined && $(this).data('section_intro')!=='' ) ? ' section_intro="'+$(this).data('section_intro')+'"' : '';
            output += ($(this).data('section_outro')!==undefined && $(this).data('section_outro')!=='' ) ? ' section_outro="'+$(this).data('section_outro')+'"' : '';
            output += ($(this).data('class')!==undefined && $(this).data('class')!=='' ) ? ' class="'+$(this).data('class')+'"' : '';
            output += ']\r\n';
            $(this).find('.isui_column').each(function(){
                output += '[column_dd';
                output += ($(this).data('column_span')!==undefined && $(this).data('column_span')!=='' ) ? ' span="'+$(this).data('column_span')+'"' : '';
                output += ($(this).data('animation')!==undefined && $(this).data('animation')!=='' ) ? ' animation="'+$(this).data('animation')+'"' : '';
                output += ($(this).data('duration')!==undefined && $(this).data('duration')!=='' ) ? ' duration="'+$(this).data('duration')+'"' : '';
                output += ($(this).data('delay')!==undefined && $(this).data('delay')!=='' ) ? ' delay="'+$(this).data('delay')+'"' : '';
                output += ($(this).data('class')!==undefined && $(this).data('class')!=='' ) ? ' class="'+$(this).data('class')+'"' : '';
                output += ']\r\n';
                $(this).find('.isui_element').each(function(){
                    output += $(this).data("shortcode")+"\r\n";
                });
                output += '[/column_dd]\r\n';
            });
            output += '[/section_dd]';
        });
        $('#content').val(output);
        output = output.replace(/\r\n|\r|\n/g, "<br>");
        var editor = tinymce.get('content'); 
        if(editor!==undefined && editor!==null){
            editor.setContent(output);
        }
    }


    function isui_generate_from_editor(content){
        if(content == undefined){
            content = $('#content').val();
        }
        $('.isui_content_section').remove();

        content = content.replace(/_DD/g, '_dd'); // replace old version uppercase sufixes
        content = content.replace(/(raw_dd[\s\S]*?\/raw_dd)|(code_dd[\s\S]*?\/code_dd)|(pre_dd[\s\S]*?\/pre_dd)/g, function(match){
            return match.replace(/ /g, '*space*').replace(/\t/g, '*tab*');
        });
        content = content.replace(/(text_dd[\s\S]*?\/text_dd)/g, function(match){
            return match.replace(/\r\n|\r|\n/g, '<br>');
        });
        content = content.replace(/raw_dd\*.*?\*/g, 'raw_dd ').replace(/code_dd\*.*?\*/g, 'code_dd ').replace(/pre_dd\*.*?\*/g, 'pre_dd ');
        content = content.replace(/\r\n|\r|\n/g, '*nl*').replace(/\t/g,'').replace(/\s+/g,' ');
        content = content.replace(/<p>\[section_dd/g, '[section_dd').replace(/\[\/section_dd]<\/p>/g,'[/section_dd]');
        content = content.replace(/\]<br \/>/g, ']');
        content = content.replace(/'/g, '&#8217;');
        content = content.replace(/&/g, '*and*');
        content = content.replace(/</g, '*lt*').replace(/>/g, '*gt*');
        content = content.replace(/\](\*nl\*)+\[/g,'][');
        content = content.replace(/\[/g, '<').replace(/\]/g, '>');
        content = isui_trim(content,'*nl*');

        if(content!==''){
            var unwrapped = content.split(/<span_dd.*?<\/section_dd>/g),
                i;
            for (i=0; i < unwrapped.length; i++){
                if(unwrapped[i]!==''){
                    content = content.replace(unwrapped[i], '<span_dd><column_dd span="12"><text_dd>' + unwrapped[i] + '</text_dd></column_dd></span_dd>');
                }
            };
        }
        var output='';
        $dd_tab_content.removeClass('syntax_error');
        $('.isui-error_msg').remove();
        var xmlDoc = '';
        try {
            xmlDoc = $.parseXML( '<root>'+content+'</root>' );
        } catch (err) {
            $dd_tab_content.append('<p class="isui-error_msg">'+isui_from_WP.error_to_editor+'</p>');
            $dd_tab_content.addClass('syntax_error');
            console.log(err);
            return;
        }
        var $xml = $(xmlDoc);
        var no_of_sections = 0;
        $xml.find('section_dd').each(function(){
            no_of_sections++;
            output += '<div class="isui_content_section"'+
                ' data-bg_color="'+(($(this).attr("bg_color")!==undefined)?$(this).attr("bg_color"):'')+
                '" data-fullwidth="'+(($(this).attr("fullwidth")!==undefined)?$(this).attr("fullwidth"):'')+
                '" data-video_bg="'+(($(this).attr("video_bg")!==undefined)?$(this).attr("video_bg"):'')+
                '" data-bg_image="'+(($(this).attr("bg_image")!==undefined)?$(this).attr("bg_image"):'')+
                '" data-parallax="'+(($(this).attr("parallax")!==undefined)?$(this).attr("parallax"):'')+
                '" data-section_title="'+(($(this).attr("section_title")!==undefined)?$(this).attr("section_title"):'')+
                '" data-section_id="'+(($(this).attr("section_id")!==undefined)?$(this).attr("section_id"):'')+
                '" data-section_intro="'+(($(this).attr("section_intro")!==undefined)?$(this).attr("section_intro"):'')+
                '" data-section_outro="'+(($(this).attr("section_outro")!==undefined)?$(this).attr("section_outro"):'')+
                '" data-class="'+(($(this).attr("class")!==undefined)?$(this).attr("class"):'')+
                '">'+(($(this).attr("section_title")!==undefined)? '<div class="isui_section_title">'+$(this).attr("section_title")+'</div>':'')+
                '<span class="isui_section_handler" title="Rearange Sections"></span><span class="isui_section_delete" title="'+isui_from_WP.delete_section+'"></span><span class="isui_section_duplicate" title="'+isui_from_WP.duplicate_section+'"></span><span class="isui_section_edit" title="'+isui_from_WP.edit_section+'"></span><span class="isui_remove_column" title="'+isui_from_WP.remove_column+'"></span><span class="isui_add_column" title="'+isui_from_WP.add_column+'"></span>';
            $(this).find('column_dd').each(function(){
                output += '<div class="isui_column"'+
                'data-column_span="'+$(this).attr("span")+
                '" data-animation="'+(($(this).attr("animation")!==undefined)?$(this).attr("animation"):'')+
                '" data-duration="'+(($(this).attr("duration")!==undefined)?$(this).attr("duration"):'')+
                '" data-delay="'+(($(this).attr("delay")!==undefined)?$(this).attr("delay"):'')+
                '" data-class="'+(($(this).attr("class")!==undefined)?$(this).attr("class"):'')+
                '">';
                $(this).contents().each(function(){
                    var element_name=isui_from_WP.ISU_plugin_shortcode_names[(this).nodeName];
                    if(element_name===undefined){
                        element_name = (this).nodeName;
                    }
                    var $temp = $("#isui_temp").clone();
                    $(this).appendTo($temp);
                    var shortcode = $temp.html();
                    shortcode = shortcode.replace(/</g, '[').replace(/>/g, ']');
                    $temp.remove();
                    if(element_name==="#text"){
                        element_name=isui_from_WP.text;
                        shortcode = '[text_dd]'+shortcode+'[/text_dd]';
                    }

                    var element_content = shortcode.replace(/\[/g, '<').replace(/\]/g, '>').replace(/\*and\*/g, '&').replace(/\*lt\*/g, '<').replace(/\*gt\*/g, '>').replace(/\*space\*/g, ' ').replace(/\*nl\*/g, '\r\n').replace(/\*tab\*/g, '\t');
                    element_content = $("<div>"+element_content+"</div>").text().substring(0, 200);
                    element_content = (element_content!=='') ? '<span class="element_excerpt"> - '+element_content+'...</span>' :'';
                    output += "<div class='isui_element' title='"+element_name+"' data-shortcode='"+shortcode+"'>";
                    output += '<span class="element_name">'+element_name+element_content+'</span>';
                    output += '<span class="isui_element_delete" title="'+isui_from_WP.delete_element+'"></span><span class="isui_element_duplicate" title="'+isui_from_WP.duplicate_element+'"></span><span class="isui_element_edit" title="'+isui_from_WP.edit_element+'"></span></div>';
                });
                output += '<span class="isui_add_element" title="'+isui_from_WP.add_element+'"></span><span class="isui_column_edit" title="'+isui_from_WP.edit_column+'"></span><p>'+$(this).attr("span")+'/12</p>';
                output += '</div>';
            });
            output += '</div>';
        });
        output = output.replace(/\*and\*/g, '&');
        output = output.replace(/\*lt\*/g, '<').replace(/\*gt\*/g, '>');
        output = output.replace(/\*space\*/g, ' ').replace(/\*nl\*/g, '\r\n').replace(/\*tab\*/g, '\t');
        $dd_tab_content.append(output);
        isui_make_elements_resizable();
        isui_make_elements_sortable();
        isui_rebuild_widths();
        $('.isui_content_section').each(function(){
            var count_columns = $(this).find('.isui_column').length;
            if(count_columns==1){
                $(this).find('.isui_remove_column').addClass('isui_disabled');
            }
            else if(count_columns==12){
                $(this).find('.isui_add_column').addClass('isui_disabled');
            }
        });
        if(no_of_sections===0){
            $("#isui_dragdrop_empty").show();
        }
        else{
            $("#isui_dragdrop_empty").hide();
        }
    }


    function isui_resize_others($item,diff){
        var $sibling = $item.next();
        var new_width = $sibling.data("initial_width") + diff;
        $sibling.css("width", new_width);
        $item.css("height", "auto");
    }


    function isui_columns_spans($item){
        var total_width=0;
        $item.children('.isui_column').each(function(){
            total_width += $(this).width();
        }).each(function(){
            var span = Math.round($(this).width() / (total_width / 12));
            if($(this).children('p').length === 0){
                $(this).append('<p></p>');
            }
            $(this).children('p').html(span + '/12');
            $(this).data("column_span",span);
        });
    }


    function isui_out_of_grid($item){
        var count = $item.children('.isui_column').length;
        var i = 0;
        var grid = Math.floor(isui_total_width($item)/12);
        if(count==5){
            $item.children('.isui_column').each(function(){
                var col_width = (i<2) ? grid*3 : grid*2;
                i++;
                $(this).css("width", col_width+"px");
            });
        }
        else if(count>6){
            $item.children('.isui_column').each(function(){
                var col_width = (i<1) ? grid*(12-count+1) : grid*1;
                i++;
                $(this).css("width", col_width+"px");
            });
        }
    }


    function isui_total_width($item){
        var total_width=0;
        $item.children('.isui_column').each(function(){
            total_width += $(this).width();
        });
        return total_width;
    }


    function isui_rebuild_widths(){
        $("#isui_dragdrop").find('.isui_content_section').each(function(){
            var resize_sectionWidth = $(this).width();
            var resize_grid = Math.floor(resize_sectionWidth/12);
            $(this).children('.isui_column').each(function(){
                var resize_col_width = $(this).data("column_span")*resize_grid;
                $(this).css("width", resize_col_width+"px");
                var max_width = $(this).width() + $(this).next().width();
                if($(this).hasClass('ui-resizable')){
                    $(this).resizable( "option", {
                        grid: [ resize_grid, 10 ],
                        minWidth: resize_grid,
                        maxWidth: max_width
                    });
                }
            });
            var maxHeight = -1;
            var $handlers = $(this).find('.ui-resizable-e');
            $handlers.height('100%');
            $handlers.each(function(){
                if ($(this).height() > maxHeight)
                        maxHeight = $(this).height();
            });
            $handlers.each(function(){
                $(this).height(maxHeight);
            });
        });
    }


    function htmlspecialchars(string, quote_style, charset, double_encode) {
      var optTemp = 0,
        i = 0,
        noquotes = false;
      if (typeof quote_style === 'undefined' || quote_style === null) {
        quote_style = 2;
      }
      string = string.toString();
      if (double_encode !== false) { // Put this first to avoid double-encoding
        string = string.replace(/&/g, '&amp;');
      }
      string = string.replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      var OPTS = {
        'ENT_NOQUOTES': 0,
        'ENT_HTML_QUOTE_SINGLE': 1,
        'ENT_HTML_QUOTE_DOUBLE': 2,
        'ENT_COMPAT': 2,
        'ENT_QUOTES': 3,
        'ENT_IGNORE': 4
      };
      if (quote_style === 0) {
        noquotes = true;
      }
      if (typeof quote_style !== 'number') { // Allow for a single string or an array of string flags
        quote_style = [].concat(quote_style);
        for (i = 0; i < quote_style.length; i++) {
          // Resolve string input to bitwise e.g. 'ENT_IGNORE' becomes 4
          if (OPTS[quote_style[i]] === 0) {
            noquotes = true;
          } else if (OPTS[quote_style[i]]) {
            optTemp = optTemp | OPTS[quote_style[i]];
          }
        }
        quote_style = optTemp;
      }
      if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
        string = string.replace(/'/g, '&#039;');
      }
      if (!noquotes) {
        string = string.replace(/"/g, '&quot;');
      }

      return string;
    }


    function isui_trim(str, charlist) {
        //http://phpjs.org/functions/trim/
      var whitespace, l = 0,
        i = 0;
      str += '';
      if (!charlist) {
        whitespace =
          ' \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000';
      } else {
        charlist += '';
        whitespace = charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '$1');
      }
      l = str.length;
      for (i = 0; i < l; i++) {
        if (whitespace.indexOf(str.charAt(i)) === -1) {
          str = str.substring(i);
          break;
        }
      }
      l = str.length;
      for (i = l - 1; i >= 0; i--) {
        if (whitespace.indexOf(str.charAt(i)) === -1) {
          str = str.substring(0, i + 1);
          break;
        }
      }
      return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
    }


    var scrollbar_options = {
        theme:'dark-thin',
        mouseWheelPixels: 100,
        scrollInertia: 500
    };

    var fancybox_options = {
        'width':'95%',
        'height':'100%',
        'scrolling':'no',
        'autoDimensions':false,
        'transitionIn':'none',
        'transitionOut':'none',
        'type':'ajax',
        'titleShow':false,
        'onComplete':function(){
            $('.isui-colorpicker').wpColorPicker();
            setTimeout(function(){
                $(".textarea_cleditor").cleditor().each(function(){
                    $('#isui_edit_shortcode_wrapper').mCustomScrollbar("update");
                });
            },100);
            $("#isui_shortcodes_list .isui_select_shortcode").filter(":even").addClass('even');
            $('#isui_shortcode_selector .clear_field').hide();
            $('#isui_shortcodes_list').css('height', '-=40px').mCustomScrollbar(scrollbar_options);
            $('#isui_edit_shortcode_wrapper').mCustomScrollbar(scrollbar_options);
        }
    };


    

    $("#wp-content-editor-container").after('<div id="isui_dragdrop"><div id="isui_tools"></div></div>');

    var saved_layouts = isui_from_WP.saved_layouts.split('|');

    var index,
        layout_options_out ='<option value="">'+isui_from_WP.layout_select_saved_first+'</option>';
    if(saved_layouts!=''){
        for (index = 0; index < saved_layouts.length; ++index) {
            layout_options_out += '<option value="'+saved_layouts[index]+'">'+saved_layouts[index]+'</option>';
        }
    }
    $("#isui_dragdrop").append('<div id="isui_dragdrop_empty"><select name="isui_load_layout" id="isui_load_layout">'+layout_options_out+'</select><br>'+isui_from_WP.layout_select_saved_second+'<br><a id="isui_add_section_second">'+isui_from_WP.add_section+'</a></div>');
    
    $("#insert-media-button").after('<a id="isui_shortcode_button" class="button insert-shortcode add_shortcodes" title="'+isui_from_WP.add_edit_shortcode+'"><span class="wp-media-buttons-icon"></span>'+isui_from_WP.add_edit_shortcode+'</a>');

    var $dd_tab = $("#isui_content-dd");
    var $dd_tab_content = $("#isui_dragdrop");
    var $dd_tab_tools = $("#isui_tools");
    var $dd_shortcode_button = $("#isui_shortcode_button");
    var dom = tinymce.DOM;
    $dd_tab_content.css('minHeight',$("#wp-content-editor-container .wp-editor-area").height()+53+'px');
    $dd_tab_content.hide();
    $dd_tab_tools.append('<input type="button" id="isui_add_section" class="isui_button" title="" value="'+isui_from_WP.add_section+'">');
    $dd_tab_tools.append('<input type="button" id="isui_layout_save" class="isui_button" title="" value="'+isui_from_WP.layout_save+'">');
    $dd_tab_tools.append('<input type="button" id="isui_layout_delete" class="isui_button" title="" value="'+isui_from_WP.layout_delete+'">');
    $dd_tab_tools.append('<p id="isui_temp" style="display:none;"></p>');
    $dd_tab_tools.append('<a id="isui_add_section_bottom">'+isui_from_WP.add_section+'</a>');
    $dd_tab_content.sortable({ 
        items: "> .isui_content_section", 
        handle: ".isui_section_handler", 
        revert: true, 
        axis: "y", 
        cursor: "move", 
        tolerance: "pointer",
        stop: function(){
            isui_rebuild_widths();
            isui_write_to_editor();
        },
        over: isui_rebuild_widths
    });
    $dd_tab_content.disableSelection();

    if($.cookie('isui_isui_activated') === 'activated'){
        isui_activate_dd();
    }

    $dd_tab.click(function(e){
        e.preventDefault();
        isui_activate_dd();
    });

    $(".wp-switch-editor").click(function(e){
        e.preventDefault();
        if(!$(this).hasClass('switch-dd') && $dd_tab.hasClass('active')){
            $dd_tab_content.hide();
            $dd_shortcode_button.show();
            $dd_tab.removeClass('active');
            $("#wp-content-editor-container").show();
            if($(this).hasClass('switch-tmce')){
                dom.addClass('wp-content-wrap', 'tmce-active');
            }
            if($(this).hasClass('switch-html')){
                dom.addClass('wp-content-wrap', 'html-active');
            }
            $.removeCookie('isui_isui_activated', { path: '/' });
        }
    });



    $dd_shortcode_button.click(function(e){
        e.preventDefault();
        var selected_content = '';
        if($('#wp-content-wrap').hasClass('tmce-active')){
            selected_content = tinyMCE.activeEditor.selection.getContent({format : 'html'});
        }
        else{
            var textComponent = document.getElementById('content');
            if (document.selection !== undefined){
                textComponent.focus();
                var sel = document.selection.createRange();
                selected_content = sel.text;
            }
            else if (textComponent.selectionStart !== undefined){
                var startPos = textComponent.selectionStart;
                var endPos = textComponent.selectionEnd;
                selected_content = textComponent.value.substring(startPos, endPos);
            }
        }
        selected_content = selected_content.replace(/(\r\n|\n|\r|\t)/gm,'').replace(/\s+/g,' ').replace(/<br \/> /g,'').replace(/\]\s\[/g,'][');

        var exploded = selected_content.split(' ');
        exploded = exploded[0].split(']');
        var shortcode = exploded[0].substring(1);
        selected_content = htmlspecialchars(selected_content,'ENT_QUOTES');
        selected_content = encodeURIComponent(selected_content);
        
        if(shortcode===''){
            fancybox_options.href = isui_from_WP.plugins_url + '/admin/shortcode_selector.php?editor=text';
            $.fancybox(fancybox_options);
        }
        else{
            fancybox_options.href = isui_from_WP.plugins_url + '/admin/shortcode_attributes.php?action=edit&shortcode='+shortcode+'&selected_content=' + selected_content;
            $.fancybox(fancybox_options);

        }
    });


    $("#isui_add_section, #isui_add_section_second, #isui_add_section_bottom").click(function(e){
        e.preventDefault();
        $("#isui_dragdrop_empty").hide();
        $dd_tab_content.append('<div class="isui_content_section"><span class="isui_section_handler" title="'+isui_from_WP.rearange_sections+'"></span><span class="isui_section_delete" title="'+isui_from_WP.delete_section+'"></span><span class="isui_section_duplicate" title="'+isui_from_WP.duplicate_section+'"></span><span class="isui_section_edit" title="'+isui_from_WP.edit_section+'"></span><span class="isui_remove_column isui_disabled" title="'+isui_from_WP.remove_column+'"></span><span class="isui_add_column" title="'+isui_from_WP.add_column+'"></span><div class="isui_column" data-column_span="12"><span class="isui_add_element" title="'+isui_from_WP.add_element+'"></span><span class="isui_column_edit" title="'+isui_from_WP.edit_column+'"></span><p>12/12</p></div></div>');
        isui_make_elements_sortable();
        isui_rebuild_widths();
        isui_write_to_editor();
    });


    $("#isui_layout_save").click(function(e){
        e.preventDefault();
        var name = prompt(isui_from_WP.layout_name,"");
        if (name!=null && name!=''){
            var data = {
                action: 'ISU_plugin_save_layout',
                name: name,
                layout: $('#content').val()
            };
            $.post(ajaxurl, data, function(response) {
                $('#isui_load_layout').append('<option value="'+name+'">'+name+'</option>');
                alert(response);
            });
        }
    });


    $("#isui_layout_delete").click(function(e){
        e.preventDefault();
        var name = prompt(isui_from_WP.layout_name_delete,"");
        if (name!=null && name!=''){
            var data = {
                action: 'ISU_plugin_delete_layout',
                name: name,
            };
            $.post(ajaxurl, data, function(response) {
                $('#isui_load_layout option[value="'+name+'"]').remove();
                alert(response);
            });
        }
    });


    $("#isui_load_layout").change(function(){
        var $select = $(this);
        $(this).parent().append('<div class="isui_loader"></div>');
        var selected_layout = $(this).val();
        if(selected_layout!=''){
            var data = {
                action: 'ISU_plugin_load_layout',
                selected_layout: selected_layout,
            };
            $.post(ajaxurl, data, function(response) {
                isui_generate_from_editor(response);
                isui_write_to_editor();
                $select.find('option[value=""]').attr("selected",true);
                $('.isui_loader').remove();
            });
        }
    });


    $(document).on('click', '.isui_add_column' , function(e) {
        e.preventDefault();
        if($(this).hasClass('isui_disabled')){
            return;
        }
        var $parent = $(this).parent();
        $parent.append('<div class="isui_column"><span class="isui_add_element" title="'+isui_from_WP.add_element+'"></span><span class="isui_column_edit" title="'+isui_from_WP.edit_column+'"></span></div>');
        var count = $parent.children('.isui_column').length;
        if(count==12){
            $(this).addClass('isui_disabled');
        }
        $parent.find('.isui_remove_column').removeClass('isui_disabled');
        var column_width = Math.floor($parent.width()/count);
        $parent.children('.isui_column').each(function(){
            $(this).css("width", column_width+"px");
        });
        isui_out_of_grid($parent);
        isui_columns_spans($parent);
        var grid = Math.floor(isui_total_width($parent)/12);
        $parent.children('.isui_column.ui-resizable').resizable("option", {
            grid: [ grid, 10 ],
            minWidth: grid
        });
        isui_make_elements_resizable();
        isui_make_elements_sortable();
        isui_rebuild_widths();
        isui_write_to_editor();
    });


    $(document).on('click', '.isui_remove_column' , function(e) {
        e.preventDefault();
        if($(this).hasClass('isui_disabled')){
            return;
        }
        var $parent = $(this).parent();
        var $last_column = $parent.find('.isui_column:last-child');
        $last_column.find('.isui_element').each(function(){
            $(this).detach().appendTo($last_column.prev());
        });
        $last_column.remove();
        var count = $parent.children('.isui_column').length;
        $parent.find('.isui_add_column').removeClass('isui_disabled');
        var column_width = Math.floor($parent.width()/count);
        $parent.children('.isui_column').each(function(){
            $(this).css("width", column_width+"px");
        });
        if(count==1){
            $(this).addClass('isui_disabled');
            $parent.children('.isui_column').resizable("destroy");
        }
        else{
            $parent.children('.isui_column:last-child').resizable("destroy");
        }
        isui_out_of_grid($parent);
        isui_columns_spans($parent);
        isui_rebuild_widths();
        isui_write_to_editor();
    });


// delete section or element
    $(document).on('click', '.isui_section_delete, .isui_element_delete' , function(e) {
        e.preventDefault();
        var r = confirm(isui_from_WP.are_you_sure);
        if (r === true){
            var $parent = $(this).parent();
            var is_section = $parent.hasClass('isui_content_section');
            var no_of_sections = $parent.siblings(".isui_content_section").length;
            $parent.animate({
                height:"0px", 
                minHeight:"0px", 
                padding:"0px", 
                marginTop:"0px", 
                marginBottom:"0px", 
                border:"0px", 
                opacity:"0"
            }, 400, function(){
                $parent.remove();
                isui_rebuild_widths();
                isui_write_to_editor();
                if(no_of_sections === 0 && is_section){
                    $("#isui_dragdrop_empty").show();
                }
            });
        }
    });


// duplicate element
    $(document).on('click', '.isui_element_duplicate' , function(e) {
        e.preventDefault();
        var $parent = $(this).parent();
        $parent.clone().insertAfter($parent);
        isui_rebuild_widths();
        isui_write_to_editor();
    });


// duplicate section
    $(document).on('click', '.isui_section_duplicate' , function(e) {
        e.preventDefault();
        var $parent = $(this).parent();
        $parent.clone().insertAfter($parent);
        var $new_section = $parent.next();
        $new_section.find('.ui-resizable-handle').remove();
        isui_out_of_grid($new_section);
        isui_columns_spans($new_section);
        var grid = Math.floor(isui_total_width($new_section)/12);
        isui_make_elements_resizable();
        $new_section.children('.isui_column.ui-resizable').resizable("option", {
            grid: [ grid, 10 ],
            minWidth: grid
        });
        isui_make_elements_sortable();
        isui_rebuild_widths();
        isui_write_to_editor();
    });


// add element
    $(document).on('click', '.isui_add_element' , function(e) {
        e.preventDefault();
        $('.clicked_column').removeClass('clicked_column');
        var $column = $(this).parent();
        $column.addClass('clicked_column');
        fancybox_options.href = isui_from_WP.plugins_url + '/admin/shortcode_selector.php?editor=dnd';
        $.fancybox(fancybox_options);
    });


    $(document).on('click', '.isui_select_shortcode' , function(e) {
        e.preventDefault();
        $('.selected_shortcode').removeClass('selected_shortcode');
        $(this).addClass('selected_shortcode');
        var selected_shortcode = $(this).data('shortcode');
        var $isui_shortcode_attributes = $('#isui_shortcode_attributes');
        $.fancybox.showActivity();
        $isui_shortcode_attributes.load(isui_from_WP.plugins_url + '/admin/shortcode_attributes.php?action=new&shortcode=' + selected_shortcode, function() {
            $.fancybox.hideActivity();
            $('.isui-colorpicker').wpColorPicker();
            setTimeout(function(){$(".textarea_cleditor").cleditor();},100);
            $isui_shortcode_attributes.mCustomScrollbar(scrollbar_options);
        });
    });



// Add child
    $(document).on('click', '#isui_shortcode_add_child', function(e) {
        e.preventDefault();
        var $last_child = $('.isui_shortcode_child:last');
        $last_child.clone().insertAfter($last_child);
        var $new_child = $last_child.next();
        var $picker_field = $new_child.find('.wp-picker-container .wp-picker-input-wrap .isui-colorpicker').clone();
        $new_child.find('.wp-picker-container').parent().empty().append($picker_field);
        var $inserted_title_number = $new_child.find('h4 span');
        $inserted_title_number.text(parseInt($inserted_title_number.text(), 10) + 1);
        $('.isui-colorpicker').wpColorPicker();
        var $cloned_editor = $new_child.find(".cleditorMain");
        var $textarea = $cloned_editor.find("textarea");
        $textarea.insertBefore($cloned_editor).show();
        $cloned_editor.remove();
        $textarea.cleditor();
        $("#isui_shortcode_attributes, #isui_edit_shortcode_wrapper").mCustomScrollbar("update");
        $("#isui_shortcode_attributes, #isui_edit_shortcode_wrapper").mCustomScrollbar("scrollTo","bottom");
    });

// Remove child
    $(document).on('click', '.isui_child_remove_link', function(e) {
        e.preventDefault();
        var $parent = $(this).parents('.isui_shortcode_child');
        if($parent.parent().children('.isui_shortcode_child').length > 1){
            $parent.remove();
            $("#isui_shortcode_attributes").mCustomScrollbar("update");
            $("#isui_shortcode_attributes").mCustomScrollbar("scrollTo","bottom");
        }
        else{
            $parent.find('input,textarea').val('');
        }
    });


//filter shortcodes
    $(document).on( "keyup", '#isui_shortcode_selector_filter', function() {
        var value = $(this).val().toLowerCase();
        if (value === ''){
            $('#isui_shortcode_selector .clear_field').hide();
        }
        else{
            $('#isui_shortcode_selector .clear_field').show();
        }
        var i = 0;
        $("#isui_shortcodes_list .isui_select_shortcode").each(function() {
            $(this).removeClass('even');
            var text = $(this).text().toLowerCase();
            if (text.search(value) > -1) {
                $(this).show();
                if(i++ % 2 === 0){
                    $(this).addClass('even');
                }
            }
            else {
                $(this).hide();
            }
        });
        $("#isui_shortcodes_list").mCustomScrollbar("update");
    });



    $(document).on( "click", '#isui_shortcode_selector .clear_field', function(e) {
        e.preventDefault();
        $('#isui_shortcode_selector_filter').val('').focus();
        $(this).hide();
        $("#isui_shortcode_selector .isui_select_shortcode").each(function() {
            $(this).show().removeClass('even');
        });
        $("#isui_shortcode_selector .isui_select_shortcode").filter(":even").addClass('even');
        $("#isui_shortcodes_list").mCustomScrollbar("update");
    });


    $(document).on('click', '#isui_insert_shortcode, #isui_save_changes', function(e) {
        e.preventDefault();
        var action = $('#isui_action').val();
        var selected_shortcode = $('#isui_shortcode').val();
        var shortcode_title = $('#isui_shortcodes_list').find('.selected_shortcode .item-title').text();
        var ISU_plugin_3rd_party = isui_from_WP.ISU_plugin_3rd_party;
        ISU_plugin_3rd_party = ISU_plugin_3rd_party.split(',');

        var isui_shortcode_child_name = $('#isui_shortcode_child_name').val();
        var output = '<span class="shortcodeblock ' + selected_shortcode + '">[' + selected_shortcode;
        $('.isui_shortcode_attributes .isui_shortcode_attribute').each( function() {
            if($(this).attr('type')=='checkbox' && $(this).is(':checked')){
                output += ' ' + $(this).attr('name') + '="' + $(this).val() + '"' ;
            }
            else if ($(this).attr('type')!=='checkbox' &&  $(this).val() !== '' ) {
                output += ' ' + $(this).attr('name') + '="' + $(this).val() + '"' ;
            }
        });
        output += ']';
        // children
        var count_children=0;
        $('.isui_shortcode_child').each(function() {
            output += '<span class="shortcodeblock ' + selected_shortcode + '">[' + isui_shortcode_child_name;
            $(this).find('.isui_shortcode_attribute').each(function() {
                if( $(this).attr('type') == 'checkbox' && $(this).is(':checked') ){
                    output += ' ' + $(this).attr('name') + '="' + $(this).val() + '"' ;
                }
                else if ($(this).attr('type') !== 'checkbox' &&  $(this).val() !== '' ) {
                    output += ' ' + $(this).attr('name') + '="' + $(this).val() + '"' ;
                }
            });
            output += ']';
            output += (($(this).find('.isui_shortcode_child_content').val()!==undefined) ? $(this).find('.isui_shortcode_child_content').val() : '') + '[/' + isui_shortcode_child_name + ']</span>&nbsp;';
            count_children++;
        });

        // content and wrap shortcode
        if (count_children === 0){
            output += (($('#isui_shortcode_content').val()!==undefined) ? $('#isui_shortcode_content').val() : '') + '[/' + selected_shortcode + ']</span>&nbsp;';
        }
        else{
            output += '[/' + selected_shortcode + ']</span>&nbsp;';
        }

        $.fancybox.close();

        if($dd_tab.hasClass('active')){
            if(action==='new'){
                output = output.replace(/'/g, '&#8217;');
                var element_content = output.replace(/\[/g, '<').replace(/\]/g, '>').replace(/\*and\*/g, '&').replace(/\*lt\*/g, '<').replace(/\*gt\*/g, '>').replace(/\*space\*/g, ' ').replace(/\*nl\*/g, '\r\n').replace(/\*tab\*/g, '\t');
                element_content = $("<div>"+element_content+"</div>").text().substring(0, 200);
                element_content = (element_content!=='') ? '<span class="element_excerpt"> - '+element_content+'...</span>' :'';
                $('.clicked_column').find('.isui_add_element').before("<div class='isui_element' title='"+shortcode_title+"' data-shortcode='"+output+"'><span class='element_name'>"+shortcode_title+element_content+'</span><span class="isui_element_delete" title="'+isui_from_WP.delete_element+'"></span><span class="isui_element_duplicate" title="'+isui_from_WP.duplicate_element+'"></span><span class="isui_element_edit" title="'+isui_from_WP.edit_element+'"></span></div>');
                $('.clicked_column').removeClass('clicked_column');
                isui_rebuild_widths();
            }
            else if(action==='edit'){
                $('.editing_element').data('shortcode',output).removeClass('editing_element');
            }
            isui_write_to_editor();
        }
        else{
            window.send_to_editor(output);
        }
    });

// edit element
    $(document).on( "click", '.isui_element_edit', function() {
        var $parent = $(this).parent();
        var selected_content = $parent.data('shortcode');
        selected_content = selected_content.replace('\r\n','');
        var exploded = selected_content.split(' ');
        exploded = exploded[0].split(']');
        var shortcode = exploded[0].substring(1);
        $('.editing_element').removeClass('editing_element');
        $parent.addClass('editing_element');
        selected_content = htmlspecialchars(selected_content,'ENT_QUOTES');
        selected_content = encodeURIComponent(selected_content);
        $.fancybox({
            'height':'100%',
            'width':'70%',
            'scrolling':'no',
            'autoDimensions':false,
            'transitionIn':'elastic',
            'transitionOut':'elastic',
            'titleShow':false,
            'orig': $parent,
            'type':'ajax',
            'ajax' : {
                type    : "POST",
                data    : 'selected_content='+selected_content
            },
            'href' : isui_from_WP.plugins_url + '/admin/shortcode_attributes.php?action=edit&shortcode='+shortcode,
            'onComplete' : function(){
                $('.isui-colorpicker').wpColorPicker();
                $('#isui_edit_shortcode_wrapper').mCustomScrollbar(scrollbar_options);
                $(".textarea_cleditor").cleditor().each(function(){
                    $('#isui_edit_shortcode_wrapper').mCustomScrollbar("update");
                });
            }
        });
    });


// edit column
    $(document).on('click', '.isui_column_edit' , function(e) {
        e.preventDefault();
        var $column = $(this).parent();
        $column.addClass('editing_column');
        var content = '<div class="isui_column_section_settings"><table id="isui_attributes_table">';
        content += '<tr><td class="isui_with_label"><label for="custom_class">'+isui_from_WP.custom_column_class+'</label></td><td><input type="text" id="custom_class" value="'+(($column.data('class')!==undefined)?$column.data('class'):'')+'"></td></tr>';
        content += '<tr><td class="isui_with_label"><label for="animation">'+isui_from_WP.animation+'</label></td>'+
            '<td><select id="animation">'+
                '<option value="">'+isui_from_WP.none+'</option>'+
                '<option value="flip"'+(($column.data('animation')==='flip')?' selected':'')+'>'+isui_from_WP.flip+'</option>'+
                '<option value="flipInX"'+(($column.data('animation')==='flipInX')?' selected':'')+'>'+isui_from_WP.flipInX+'</option>'+
                '<option value="flipInY"'+(($column.data('animation')==='flipInY')?' selected':'')+'>'+isui_from_WP.flipInY+'</option>'+
                '<option value="fadeIn"'+(($column.data('animation')==='fadeIn')?' selected':'')+'>'+isui_from_WP.fadeIn+'</option>'+
                '<option value="fadeInUp"'+(($column.data('animation')==='fadeInUp')?' selected':'')+'>'+isui_from_WP.fadeInUp+'</option>'+
                '<option value="fadeInDown"'+(($column.data('animation')==='fadeInDown')?' selected':'')+'>'+isui_from_WP.fadeInDown+'</option>'+
                '<option value="fadeInLeft"'+(($column.data('animation')==='fadeInLeft')?' selected':'')+'>'+isui_from_WP.fadeInLeft+'</option>'+
                '<option value="fadeInRight"'+(($column.data('animation')==='fadeInRight')?' selected':'')+'>'+isui_from_WP.fadeInRight+'</option>'+
                '<option value="fadeInUpBig"'+(($column.data('animation')==='fadeInUpBig')?' selected':'')+'>'+isui_from_WP.fadeInUpBig+'</option>'+
                '<option value="fadeInDownBig"'+(($column.data('animation')==='fadeInDownBig')?' selected':'')+'>'+isui_from_WP.fadeInDownBig+'</option>'+
                '<option value="fadeInLeftBig"'+(($column.data('animation')==='fadeInLeftBig')?' selected':'')+'>'+isui_from_WP.fadeInLeftBig+'</option>'+
                '<option value="fadeInRightBig"'+(($column.data('animation')==='fadeInRightBig')?' selected':'')+'>'+isui_from_WP.fadeInRightBig+'</option>'+
                '<option value="slideInLeft"'+(($column.data('animation')==='slideInLeft')?' selected':'')+'>'+isui_from_WP.slideInLeft+'</option>'+
                '<option value="slideInRight"'+(($column.data('animation')==='slideInRight')?' selected':'')+'>'+isui_from_WP.slideInRight+'</option>'+
                '<option value="bounceIn"'+(($column.data('animation')==='bounceIn')?' selected':'')+'>'+isui_from_WP.bounceIn+'</option>'+
                '<option value="bounceInDown"'+(($column.data('animation')==='bounceInDown')?' selected':'')+'>'+isui_from_WP.bounceInDown+'</option>'+
                '<option value="bounceInUp"'+(($column.data('animation')==='bounceInUp')?' selected':'')+'>'+isui_from_WP.bounceInUp+'</option>'+
                '<option value="bounceInLeft"'+(($column.data('animation')==='bounceInLeft')?' selected':'')+'>'+isui_from_WP.bounceInLeft+'</option>'+
                '<option value="bounceInRight"'+(($column.data('animation')==='bounceInRight')?' selected':'')+'>'+isui_from_WP.bounceInRight+'</option>'+
                '<option value="rotateIn"'+(($column.data('animation')==='rotateIn')?' selected':'')+'>'+isui_from_WP.rotateIn+'</option>'+
                '<option value="rotateInDownLeft"'+(($column.data('animation')==='rotateInDownLeft')?' selected':'')+'>'+isui_from_WP.rotateInDownLeft+'</option>'+
                '<option value="rotateInDownRight"'+(($column.data('animation')==='rotateInDownRight')?' selected':'')+'>'+isui_from_WP.rotateInDownRight+'</option>'+
                '<option value="rotateInUpLeft"'+(($column.data('animation')==='rotateInUpLeft')?' selected':'')+'>'+isui_from_WP.rotateInUpLeft+'</option>'+
                '<option value="rotateInUpRight"'+(($column.data('animation')==='rotateInUpRight')?' selected':'')+'>'+isui_from_WP.rotateInUpRight+'</option>'+
                '<option value="lightSpeedIn"'+(($column.data('animation')==='lightSpeedIn')?' selected':'')+'>'+isui_from_WP.lightSpeedIn+'</option>'+
                '<option value="rollIn"'+(($column.data('animation')==='rollIn')?' selected':'')+'>'+isui_from_WP.rollIn+'</option>'+
                '<option value="flash"'+(($column.data('animation')==='flash')?' selected':'')+'>'+isui_from_WP.flash+'</option>'+
                '<option value="bounce"'+(($column.data('animation')==='bounce')?' selected':'')+'>'+isui_from_WP.bounce+'</option>'+
                '<option value="shake"'+(($column.data('animation')==='shake')?' selected':'')+'>'+isui_from_WP.shake+'</option>'+
                '<option value="tada"'+(($column.data('animation')==='tada')?' selected':'')+'>'+isui_from_WP.tada+'</option>'+
                '<option value="swing"'+(($column.data('animation')==='swing')?' selected':'')+'>'+isui_from_WP.swing+'</option>'+
                '<option value="wobble"'+(($column.data('animation')==='wobble')?' selected':'')+'>'+isui_from_WP.wobble+'</option>'+
                '<option value="pulse"'+(($column.data('animation')==='pulse')?' selected':'')+'>'+isui_from_WP.pulse+'</option>'+
            '</select></td></tr>';
        content += '<tr><td class="isui_with_label"><label for="duration">'+isui_from_WP.animation_duration+'</label></td><td><input type="text" id="duration" value="'+(($column.data('duration')!==undefined)?$column.data('duration'):'')+'"></td></tr>';
        content += '<tr><td class="isui_with_label"><label for="delay">'+isui_from_WP.animation_delay+'</label></td><td><input type="text" id="delay" value="'+(($column.data('delay')!==undefined)?$column.data('delay'):'')+'"></td></tr>';
        content += '<tr><td class="isui_insert_shortcode_button" colspan="2"><a href="#" class="button-primary" id="isui_save_column_settings">'+isui_from_WP.save+'</a></td></tr>';
        content += '</table>';
        content += '</div>';
        $.fancybox(content,{
            'onClosed':function(){
                $('.editing_column').removeClass('editing_column');
            },
            'transitionIn':'elastic',
            'transitionOut':'elastic',
            'orig': $(this)
        });
    });
    $(document).on('click', '#isui_save_column_settings' , function(e) {
        e.preventDefault();
        var $settings = $(this).parents('#isui_attributes_table');
        $('.editing_column')
            .data('class', $settings.find('#custom_class').val())
            .data('animation', $settings.find('#animation').val())
            .data('duration', $settings.find('#duration').val())
            .data('delay', $settings.find('#delay').val());
        $.fancybox.close();
        isui_write_to_editor();
    });


// edit section
    $(document).on('click', '.isui_section_edit' , function(e) {
        e.preventDefault();
        var $section = $(this).parent();
        $section.addClass('editing_section');
        var content = '<div class="isui_column_section_settings"><table id="isui_attributes_table" class="isui_column_section_settings">';
        content += '<tr><td class="isui_with_label"><label for="section_title">'+isui_from_WP.section_title+'</label></td><td><input type="text" id="section_title" value="'+(($section.data('section_title')!==undefined)?$section.data('section_title'):'')+'"></td></tr>';
        content += '<tr><td class="isui_with_label"><label for="section_id">'+isui_from_WP.section_id+'</label></td><td><input type="text" id="section_id" value="'+(($section.data('section_id')!==undefined)?$section.data('section_id'):'')+'"></td></tr>';
        content += '<tr><td class="isui_with_label"><label for="section_intro">'+isui_from_WP.section_intro+'</label></td><td><input type="text" id="section_intro" value="'+(($section.data('section_intro')!==undefined)?$section.data('section_intro'):'')+'"></td></tr>';
        content += '<tr><td class="isui_with_label"><label for="section_outro">'+isui_from_WP.section_outro+'</label></td><td><input type="text" id="section_outro" value="'+(($section.data('section_outro')!==undefined)?$section.data('section_outro'):'')+'"></td></tr>';
        content += '<tr><td class="isui_with_label"><label for="custom_class">'+isui_from_WP.custom_section_class+'</label></td><td><input type="text" id="custom_class" value="'+(($section.data('class')!==undefined)?$section.data('class'):'')+'"></td></tr>';
        content += '<tr><td class="isui_with_label"><label for="fullwidth">'+isui_from_WP.fullwidth+'</label></td><td><input type="checkbox" id="fullwidth" value="1"'+(($section.data('fullwidth')===1)?' checked':'')+'></td></tr>';
        content += '<tr><td class="isui_with_label"><label for="bg_color">'+isui_from_WP.background_color+'</label></td><td><input type="text" id="bg_color" class="isui-colorpicker" value="'+(($section.data('bg_color')!==undefined)?$section.data('bg_color'):'')+'"></td></tr>';
        content += '<tr><td class="isui_with_label"><label for="bg_image">'+isui_from_WP.background_image+'</label></td><td><input type="text" id="bg_image" value="'+(($section.data('bg_image')!==undefined)?$section.data('bg_image'):'')+'"><input class="button upload_image_button" type="button" value="'+isui_from_WP.upload_image+'"></td></tr>';
        content += '<tr><td class="isui_with_label"><label for="parallax">'+isui_from_WP.parallax+'</label></td><td><input type="text" id="parallax" value="'+(($section.data('parallax')!==undefined)?$section.data('parallax'):'')+'"><small>'+isui_from_WP.parallax_info+'</small></td></tr>';
        content += '<tr><td class="isui_with_label"><label for="video_bg" class="isui_attribute_with_info" title="'+isui_from_WP.video_bg_info+'">'+isui_from_WP.video_bg+'</label></td><td><input type="checkbox" id="video_bg" title="'+isui_from_WP.video_bg_info+'" value="1"'+(($section.data('video_bg')===1)?' checked':'')+'></td></tr>';
        content += '<tr><td class="isui_insert_shortcode_button" colspan="2"><a href="#" class="button-primary" id="isui_save_section_settings">'+isui_from_WP.save+'</a></td></tr>';
        content += '</table></div>';
        $.fancybox(content,{
            'onClosed':function(){
                $('.editing_section').removeClass('editing_section');
            },
            'transitionIn':'elastic',
            'transitionOut':'elastic',
            'orig': $(this)
        });
        $('.isui-colorpicker').wpColorPicker();
    });
    $(document).on('click', '#isui_save_section_settings' , function(e) {
        e.preventDefault();
        var $settings = $(this).parents('#isui_attributes_table');
        var fullwidth = ($settings.find('#fullwidth').attr('checked')==='checked')?1:0;
        var video_bg = ($settings.find('#video_bg').attr('checked')==='checked')?1:0;
        $('.editing_section')
            .data('section_title', $settings.find('#section_title').val())
            .data('section_id', $settings.find('#section_id').val())
            .data('section_intro', $settings.find('#section_intro').val())
            .data('section_outro', $settings.find('#section_outro').val())
            .data('class', $settings.find('#custom_class').val())
            .data('fullwidth', fullwidth)
            .data('video_bg', video_bg)
            .data('bg_color', $settings.find('#bg_color').val())
            .data('bg_image', $settings.find('#bg_image').val())
            .data('parallax', $settings.find('#parallax').val());
        $('.editing_section .isui_section_title').remove();
        $('.editing_section').prepend('<div class="isui_section_title">'+$settings.find('#section_title').val()+'</div>');
        $.fancybox.close();
        isui_write_to_editor();
    });


    var custom_uploader;
    $(document).on('click', '.upload_image_button' , function(e) {
        e.preventDefault();
        var $input_field = $(this).prev();
        custom_uploader = wp.media.frames.file_frame = wp.media({
            title: isui_from_WP.choose_image,
            button: {
                text: isui_from_WP.use_image
            },
            multiple: false
        });
        custom_uploader.on('select', function() {
            var attachment = custom_uploader.state().get('selection').first().toJSON();
            $input_field.val(attachment.url);
        });
        custom_uploader.open();
    });



    $(window).resize(function() {
        isui_rebuild_widths();
    });
    
    $(window).load(function() {
        isui_rebuild_widths();
    });

        
});
