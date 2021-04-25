function getProbabilities(text) {
	let dict = new Object();

	for (let i = 0; i < text.length; i++) {
		let key = text.charAt(i);
		if (!(key in dict)) {
			dict[key] = 1;
		} else {
			let value = dict[key];
			dict[key] = value + 1;
		}
	}

	for (let key in dict) {
		let value = dict[key];
		dict[key] = Math.round((value / text.length) * Math.pow(10, 2)) / Math.pow(10, 2);

	}
	return dict;
}

var timeout_to_show;

String.prototype.paddingLeft = function (paddingValue) {
	return String(paddingValue + this).slice(-paddingValue.length);
};

$(document).ready(function () {
	$('[data-toggle="tooltip"]').tooltip();
});

$(document).ready(function () {
	$("#huffman_input").keyup(function () {
		var input = $("#huffman_input").val();

		if (input != "")
			var result = interpret_text(input);

		let huffman_probabilities = getProbabilities(input);
		$("#huffman_probabilities").html(JSON.stringify(huffman_probabilities));

		update_gui_elements(result);


		let arr = ResultHamming();
		$("#huffman_bits_with_errors").html(arr);
		let final_arr = DecodeHamming(arr);
	});
});

function ResultHamming() {
	var huffman_input = document.getElementById('huffman_input').value;
	var huff = new HuffmanEncoding(huffman_input);
	var e = huff.encoded_string;

	let arr = [];

	if (e.length % 4 !== 0) {
		for (let i = 0; i < e.length % 4; i++) {
			e += "0";
		}
	}

	for (let i = 0, j = 0; i < e.length; i += 4, j++) {
		arr[j] = e.substring(i, i + 4);
	}

	for (let i = 0; i < arr.length; i++) {
		arr[i] = EncodeHamming(arr[i]);
	}

	arr = AddError(arr);
	return arr;
}

function DecodeHamming(arr) {
	const syndromes = {
		'001': 6,
		'010': 5,
		'011': 3,
		'100': 4,
		'101': 0,
		'110': 2,
		'111': 1,
	};
	console.log(arr)

	for (let i = 0; i < arr.length; i++) {
		console.log(i);
		let s = getSFromBits(arr[i]);
		let index = syndromes[s];
		if (index !== null) {
			arr[i].charAt(index) === '0' ? '1' : '0';
		}
	}
	return arr;
}

function getSFromBits(bits) {
	let i1 = parseInt(bits.charAt(0));
	let i2 = parseInt(bits.charAt(1));
	let i3 = parseInt(bits.charAt(2));
	let i4 = parseInt(bits.charAt(3));

	let r1 = parseInt(bits.charAt(4));
	let r2 = parseInt(bits.charAt(5));
	let r3 = parseInt(bits.charAt(6));

	let S1 = r1 ^ i1 ^ i2 ^ i3;
	let S2 = r2 ^ i2 ^ i3 ^ i4;
	let S3 = r3 ^ i1 ^ i2 ^ i4;

	let S = S1.toString() + S2.toString() + S3.toString();

	console.log('S', S);
	return S;
}

function AddError(arr) {
	for (let i = 0; i < arr.length; i++) {
		var randomIndex = Math.floor(Math.random() * 7);
		let error = arr[i].charAt(randomIndex) == "1" ? "0" : "1";
		let kek = arr[i].substring(0, randomIndex) + error + arr[i].substring(randomIndex + 1, 8);
		arr[i] = kek;
	}
	return arr;
}

function EncodeHamming(input) {
	var i1 = parseInt(input.charAt(0));
	var i2 = parseInt(input.charAt(1));
	var i3 = parseInt(input.charAt(2));
	var i4 = parseInt(input.charAt(3));

	console.log("i", i1, i2, i3, i4);

	var r1 = i1 ^ i2 ^ i3;
	var r2 = i2 ^ i3 ^ i4;
	var r3 = i1 ^ i2 ^ i4;

	return input + r1 + r2 + r3;
}

$(document).ready(function () {
	$("#decode_input").keyup(function () {
		var input = $("#decode_input").val();

		var huffman_input = document.getElementById('huffman_input').value;
		var huff = new HuffmanEncoding(huffman_input);
		var e = huff.encoded_string;
		console.log("encoded " + e);
		var t = huff.decode(e);
		console.log(t);

		var result = t;
		$("#decode_result").html(result);

		// if (input != "")
		// 	var result = interpret_text(input);

		// update_gui_elements(result);
	});
});

$(document).ready(function () {
	var target = document.getElementById("huffman_input");
	target.addEventListener("dragover", function (e) {
		e.preventDefault();
	}, true);
	target.addEventListener("drop", function (e) {
		e.preventDefault();
		load_file_text(e.dataTransfer.files[0]);
	}, true);
});

function load_file_text(file) {
	var reader = new FileReader();

	reader.onload = function (e) {
		$("#huffman_input").val(e.target.result);
		$("#huffman_input").keyup();
	};

	reader.readAsText(file);
}

$(document).ready(function () {
	var target = document.getElementById("huffman_bits");
	target.addEventListener("dragover", function (e) {
		e.preventDefault();
	}, true);
	target.addEventListener("drop", function (e) {
		e.preventDefault();
		load_file(e.dataTransfer.files[0]);
	}, true);
});

$(document).ready(function () {
	$("#huffman_upload_input").change(function (e) {
		var input = document.getElementById("huffman_upload_input");
		var file = input.files[0];
		load_file(file);
	});
});

function load_file(file) {
	var reader = new FileReader();

	reader.onload = function (e) {
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
	if (encoded_tree !== undefined && encoded_tree.length != 0) {
		$("#huffman_graph i").hide();

		visualize(encoded_tree, ($("#huffman_graph").hasClass("fullscreen")) ? true : false);

		$("#huffman_graph-canvaswidget").fadeTo(0, 0);
		timeout_to_show = setTimeout(function () {
			$("#huffman_graph-canvaswidget").fadeTo(0, 1);
		}, 550);
	} else {
		$("#huffman_graph i").show();
	}
}

function update_huffman_bits(bit_string) {
	if (bit_string !== undefined && bit_string != "") {
		$("#huffman_bits").html(bit_string);
	} else {
		$("#huffman_bits").html("<i>Enter text to see the result...</i>");
	}
}

function update_huffman_download(file_output) {
	var blob = new Blob([file_output], {
		type: "application/octet-stream"
	});
	var url = window.URL.createObjectURL(blob);
	$("#huffman_download").attr("href", url);
	$("#huffman_download").attr("download", "Encoded.txt");
}

function BinaryHeap(scoreFunction) {
	this.content = [];
	this.scoreFunction = scoreFunction;
}

BinaryHeap.prototype = {
	push: function (element) {
		this.content.push(element);
		this.bubbleUp(this.content.length - 1);
	},

	pop: function () {
		var result = this.content[0];
		var end = this.content.pop();
		if (this.content.length > 0) {
			this.content[0] = end;
			this.sinkDown(0);
		}
		return result;
	},

	remove: function (node) {
		var length = this.content.length;
		for (var i = 0; i < length; i++) {
			if (this.content[i] != node) continue;
			var end = this.content.pop();
			if (i == length - 1) break;
			this.content[i] = end;
			this.bubbleUp(i);
			this.sinkDown(i);
			break;
		}
	},

	size: function () {
		return this.content.length;
	},

	bubbleUp: function (n) {
		var element = this.content[n],
			score = this.scoreFunction(element);
		while (n > 0) {
			var parentN = Math.floor((n + 1) / 2) - 1,
				parent = this.content[parentN];
			if (score >= this.scoreFunction(parent))
				break;

			this.content[parentN] = element;
			this.content[n] = parent;
			n = parentN;
		}
	},

	sinkDown: function (n) {
		var length = this.content.length,
			element = this.content[n],
			elemScore = this.scoreFunction(element);

		while (true) {

			var child2N = (n + 1) * 2,
				child1N = child2N - 1;
			var swap = null;

			if (child1N < length) {

				var child1 = this.content[child1N],
					child1Score = this.scoreFunction(child1);

				if (child1Score < elemScore)
					swap = child1N;
			}

			if (child2N < length) {
				var child2 = this.content[child2N],
					child2Score = this.scoreFunction(child2);
				if (child2Score < (swap == null ? elemScore : child1Score))
					swap = child2N;
			}


			if (swap == null) break;


			this.content[n] = this.content[swap];
			this.content[swap] = element;
			n = swap;
		}
	}
};

function HuffmanEncoding(str) {
	this.str = str;

	var count_chars = {};
	for (var i = 0; i < str.length; i++)
		if (str[i] in count_chars)
			count_chars[str[i]]++;
		else
			count_chars[str[i]] = 1;

	var pq = new BinaryHeap(function (x) {
		return x[0];
	});
	for (var ch in count_chars)
		pq.push([count_chars[ch], ch]);

	while (pq.size() > 1) {
		var pair1 = pq.pop();
		var pair2 = pq.pop();
		pq.push([pair1[0] + pair2[0],
			[pair1[1], pair2[1]]
		]);
	}

	var tree = pq.pop();
	this.encoding = {};
	this._generate_encoding(tree[1], "");

	this.encoded_string = ""
	for (var i = 0; i < this.str.length; i++) {
		this.encoded_string += this.encoding[str[i]];
	}
}

HuffmanEncoding.prototype._generate_encoding = function (ary, prefix) {
	if (ary instanceof Array) {
		this._generate_encoding(ary[0], prefix + "0");
		this._generate_encoding(ary[1], prefix + "1");
	} else {
		this.encoding[ary] = prefix;
	}
}

HuffmanEncoding.prototype.inspect_encoding = function () {
	for (var ch in this.encoding) {
		print("'" + ch + "': " + this.encoding[ch])
	}
}

HuffmanEncoding.prototype.decode = function (encoded) {
	var rev_enc = {};
	for (var ch in this.encoding)
		rev_enc[this.encoding[ch]] = ch;

	var decoded = "";
	var pos = 0;
	while (pos < encoded.length) {
		var key = ""
		while (!(key in rev_enc)) {
			key += encoded[pos];
			pos++;
		}
		decoded += rev_enc[key];
	}
	return decoded;
}