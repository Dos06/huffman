function interpret_byte_array(byte_array) {
	var result = {
		"text": "",
		"bit_string": "",
		"encoded_tree": {},
		"file_output": byte_array,
		"compression_percentage": 0.0,
	};
	
	var meta_length = byteArrayToInt(byte_array.subarray(0, 4));
	var pad_count = byte_array[4];
	var meta_data = byte_array.subarray(5, 5+meta_length);
	
	if (meta_length > 25000)
		return false;
	else if (pad_count > 7)
		return false;
	
	var meta_text = "";
	for (i = 0; i < meta_length; i++) {
		meta_text += String.fromCharCode(meta_data[i]);
	}
	
	meta_text = '{"' + meta_text + '"}';
	meta_text = meta_text.replace(/,/g, '","');
	meta_text = meta_text.replace(/:/g, '":"');
	meta_text = meta_text.replace('"",""', '","');
	meta_text = meta_text.replace('"\\"', '"\\\""');
	
	try {
		var meta_object = JSON.parse(meta_text);
	}
	catch(e) {
		return false;
	}
	
	var content_bytes = byte_array.subarray(5+meta_length);
	
	var content_bit_string = "";
	var content_bit_string_formatted = "";
	for (i = 0; i < content_bytes.length; i++) {
		content_bit_string += content_bytes[i].toString(2).paddingLeft("00000000");
		content_bit_string_formatted += content_bytes[i].toString(2).paddingLeft("00000000") + " ";
	}
	result.bit_string = content_bit_string_formatted;
	
	content_bit_string = content_bit_string.substring(0, content_bit_string.length - pad_count);
	
	meta_object = array_flip(meta_object);
	
	var content_text = "";
	var buffer = "";
	for (i = 0; i < content_bit_string.length; i++) {
		buffer += content_bit_string.charAt(i);
		if (meta_object[buffer] !== undefined) {
			content_text += meta_object[buffer];
			buffer = "";
		}
	}
	
	result.text = content_text;
	
	var nodes = build_character_nodes(content_text);
	var encoded_tree = build_tree(nodes);
	
	result.encoded_tree = encoded_tree;
	
	result.compression_percentage = (1 - (result.file_output.length / content_text.length)) * 100;
	
	return result;
}

function array_flip(array) {
	var key, tmp_ar = {};

	for (key in array) {
		if (array.hasOwnProperty(key)) {
			tmp_ar[array[key]] = key;
		}
	}

	return tmp_ar;
}