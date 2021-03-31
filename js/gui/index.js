var timeout_to_show;

String.prototype.paddingLeft = function (paddingValue) {
	return String(paddingValue + this).slice(-paddingValue.length);
};

$(document).ready(function() {
	$('[data-toggle="tooltip"]').tooltip();
});

$(document).ready(function() {
	$("#huffman_input").keyup(function() {
		var input = $("#huffman_input").val();
		
		if(input != "")
			var result = interpret_text(input);
		
		update_gui_elements(result);
	});
});

$(document).ready(function() {
	var target = document.getElementById("huffman_input");
	target.addEventListener("dragover", function(e) {e.preventDefault();}, true);
	target.addEventListener("drop", function(e) {
		e.preventDefault();
		load_file_text(e.dataTransfer.files[0]);
	}, true);
});

function load_file_text(file) {
	var reader = new FileReader();
	
	reader.onload = function(e) {
		$("#huffman_input").val(e.target.result);
		$("#huffman_input").keyup();
	};
	
	reader.readAsText(file);
}

$(document).ready(function() {
	var target = document.getElementById("huffman_bits");
	target.addEventListener("dragover", function(e) {e.preventDefault();}, true);
	target.addEventListener("drop", function(e) {
		e.preventDefault();
		load_file(e.dataTransfer.files[0]);
	}, true);
});

$(document).ready(function() {
	$("#huffman_upload_input").change(function(e) {
		var input = document.getElementById("huffman_upload_input");
		var file = input.files[0];
		load_file(file);
	});
});

function load_file(file) {
	var reader = new FileReader();
	
	reader.onload = function(e) {
		var byte_array = new Uint8Array(e.target.result.length);
		
		for (i = 0; i < e.target.result.length; i++) {
			byte_array[i] = (e.target.result.charCodeAt(i));
		}
		
		var result = interpret_byte_array(byte_array);
		
		if (result === false) {
			$(".show_error").html("<div class='alert alert-dismissible alert-danger'><button type='button' class='close' data-dismiss='alert'>×</button><strong>Oh snap!</strong> It looks like the file you uploaded is either too large or incorrectly formatted.</div>");
			return;
		}
		
		update_gui_elements(result);
	};
	
	reader.readAsBinaryString(file);
}

function update_gui_elements(result) {
	$("#huffman_graph-canvaswidget").remove();
	clearTimeout(timeout_to_show);
	
	$(".show_error").html("");
	
	if (result === undefined)
		result = {};
	
	$("#huffman_input").val(result.text);
	update_huffman_graph(result.encoded_tree);
	update_huffman_bits(result.bit_string);
	update_huffman_download(result.file_output);
	// update_huffman_compression(result.compression_percentage);
}

function update_huffman_graph(encoded_tree) {
	if(encoded_tree !== undefined && encoded_tree.length != 0) {
		$("#huffman_graph i").hide();
		
		visualize(encoded_tree, ($("#huffman_graph").hasClass("fullscreen")) ? true : false);
		
		$("#huffman_graph-canvaswidget").fadeTo(0, 0);
		timeout_to_show = setTimeout(function() {
			$("#huffman_graph-canvaswidget").fadeTo(0, 1);
		}, 550);
	}
	else {
		$("#huffman_graph i").show();
	}
}

function update_huffman_bits(bit_string) {
	if (bit_string !== undefined && bit_string != "") {
		$("#huffman_bits").html(bit_string);
	}
	else {
		$("#huffman_bits").html("<i>Type to see bits, or <span>drop encoded file here</span>...</i>");
	}
}

function update_huffman_download(file_output) {
	var blob = new Blob([file_output], {type: "application/octet-stream"});
	var url = window.URL.createObjectURL(blob);
	$("#huffman_download").attr("href", url);
	$("#huffman_download").attr("download", "Encoded.txt");
}

// function update_huffman_compression(percentage){
// 	// Handle undefined
// 	if(percentage === undefined){
// 		$("#huffman_compression_bar").css("width", "0%");
// 		$("#huffman_compression").attr("data-original-title", "0%");
// 		return;
// 	}
	
	
	// Format bar
	// $("#huffman_compression_bar").css("width", Math.abs(percentage)+"%");
	
	// if(percentage < 0){
	// 	$("#huffman_compression_bar").removeClass("progress-bar-danger");
	// 	$("#huffman_compression_bar").addClass("progress-bar-danger");
	// }
	// else{
	// 	$("#huffman_compression_bar").removeClass("progress-bar-danger");
	// }
	
	// $("#huffman_compression").attr("data-original-title", Math.round(percentage, 1)+"%");
// }