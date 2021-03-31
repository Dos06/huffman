function interpret_text(text) {
	var result = {
		"text": text,
		"bit_string": "",
		"encoded_tree": {},
		"file_output": [],
		"compression_percentage": 0.0,
	};
	
	var input_data = build_character_nodes(text);
	var encoded_tree = build_tree(input_data);
	
	result.encoded_tree = encoded_tree;
	
	var paths = {};
	build_path(encoded_tree, paths);
	var pad = {"count": 0};
	var byte_array = encode_string(text, paths, pad);
	
	for (i = 0; i < byte_array.length; i++) {
		result.bit_string += byte_array[i].toString(2).paddingLeft("00000000") + " ";
	}
	
	result.file_output = build_file_output(paths, byte_array, pad.count);
	
	result.compression_percentage = (1 - (result.file_output.length / text.length)) * 100;
	
	return result;
}