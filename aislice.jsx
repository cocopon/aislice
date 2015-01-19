// Copyright 2013 cocopon
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


var CONFIG = {
	resolutions: [
		{scale: 100, postfix: ''},
		{scale: 200, postfix: '@2x'},
		{scale: 300, postfix: '@3x'}
	]
};


var util = {
	typeOf: function(value) {
		if (util.isNull(value)) {
			return 'null';
		}

		var type = typeof(value);

		if (type === 'object' && value instanceof Array) {
			return 'array';
		}

		return type;
	},

	isNull: function(value) {
		return value === null;
	},

	or: function(value, defaultValue) {
		return (value === undefined) ? defaultValue : value;
	}
};


util.array = {
	clone: function(array) {
		var clone = [];

		util.array.forEach(array, function(item) {
			clone.push(item);
		});

		return clone;
	},

	concat: function(array1, array2) {
		var result = util.array.clone(array1);

		util.array.forEach(array2, function(item) {
			result.push(item);
		});

		return result;
	},

	forEach: function(array, func, opt_scope) {
		var len = array.length;
		var scope = util.or(opt_scope, this);
		var i;

		for (i = 0; i < len; i++) {
			func.call(scope, array[i], i);
		}
	},

	insertArrayAt: function(array, itemsToAdd, opt_index) {
		var len = array.length;
		var index = util.or(opt_index, 0);
		if (index < 0) {
			index = len - index;
		}

		var result = array.slice(0, index);
		util.array.forEach(itemsToAdd, function(item) {
			result.push(item);
		});

		var i;
		for (i = index; i < len; i++) {
			result.push(array[i]);
		}

		return result;
	},

	isEmpty: function(array) {
		return array.length === 0;
	}
};


util.path = {
	getFileName: function(path) {
		var index = path.lastIndexOf('/');
		return index < 0 ?
			path :
			path.substring(index + 1);
	},

	getFolderName: function(path) {
		var index = path.lastIndexOf('/');
		return index < 0 ?
			'' :
			path.substring(0, index);
	},

	join: function(comps) {
		return comps.join('/');
	}
};


var ai = {};


ai.document = {
	isPathItem: function(value) {
		// TODO: Is there a better way?
		return !util.isNull(value.typename.match(/Item$/));
	},

	findSlices: function(document) {
		var slices = [];

		util.array.forEach(document.pathItems, function(item) {
			if (item.sliced) {
				slices.push(item);
			}
		});

		return slices;
	},

	selectPathItem: function(document, itemToSelect) {
		util.array.forEach(document.pathItems, function(item) {
			item.selected = (item === itemToSelect);
		});
	},

	exportSlice: function(document, slice, file, scale, opt_shouldUndo) {
		// Fit artboardRect to the specified slice to export
		ai.document.selectPathItem(document, slice);
		document.fitArtboardToSelectedArt(0);

		var opts = new ExportOptionsPNG24();
		opts.horizontalScale = scale;
		opts.verticalScale = scale;
		opts.artBoardClipping = true;

		document.exportFile(file, ExportType.PNG24, opts);

		// Restore artboardRect if needed
		if (util.or(opt_shouldUndo, true)) {
			app.undo();
		}
	}
};


// TODO: Is there an official document about available error codes?
ai.error = {
	NO_SUCH_ELEMENT: 1302
};


var main = function() {
	var document;
	try {
		document = app.activeDocument;
	} catch (e) {
		if (e.number === ai.error.NO_SUCH_ELEMENT) {
			alert('No documents to export.');
		}
		else {
			alert('An unexpected error has occurred.');
		}
		return;
	}

	var slices = ai.document.findSlices(document);
	if (util.array.isEmpty(slices.length)) {
		alert('No slices to export.');
		return;
	}

	var baseDir = Folder.selectDialog('Select an output directory');
	if (util.isNull(baseDir)) {
		return;
	}

	util.array.forEach(slices, function(slice) {
		var relPath = slice.name;
		var folderName = util.path.getFolderName(relPath);
		var folder = new Folder(util.path.join([baseDir, folderName]));
		if (!folder.exists) {
			folder.create();
		}

		util.array.forEach(CONFIG.resolutions, function(resolution) {
			var fileName = util.path.getFileName(relPath) + resolution.postfix;
			var file = new File(util.path.join([folder.absoluteURI, fileName]));

			ai.document.exportSlice(document, slice, file, resolution.scale, false);
		});
	});

	// Batch undo changing artboardRect for a reason of performance issue
	var totalUndoes = slices.length * CONFIG.resolutions.length;
	var i;
	for (i = 0; i < totalUndoes; i++) {
		app.undo();
	}
};


if (app && app.name === 'Adobe Illustrator') {
	main();
}
