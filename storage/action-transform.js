var storageUtils = require('./storage-utils.js'),
	log = require('../lib/logger.js');
function makePut(type, source) {
	if (!type || !source) {
		return log.d("No source or type");
	}
	return { source: source, filters: [], type: type };
}

/*
	BEGIN TRANSACTION;
	DELETE FROM $source WHERE wherify($key);
	INSERT INTO $source 

*/


exports.text = function (text) {
	var puts = [], put;
	
	/* Start Compatibility Block */
	text.thread = text.threads[0].id.substr(0, text.threads[0].id.length-1);
	text.title = text.threads[0].title;
	text.labels['color' + text.threads[0].id.substr(text.threads[0].id.length-1)] = 1;
	addTags(text);
	/* End Compatibility Block */
	log.d("Text:", text);
	// insert text
	if (text.text) {
		put = makePut("insert", "texts");
		put.insert = {
			id: text.id, from: text.from, to: text.to,
			text: text.text, time: storageUtils.timetoString(text.time), 
			thread: text.thread,
			tags: text.tags, mentions: text.mentions
		};
		puts.push(put);
	}
	
	// insert thread
	if (text.thread) {
		put = makePut(text.id == text.thread ? "insert" : "update", 'threads');
		put.filters.push(['id', 'eq', text.thread]);

		if (text.id == text.thread) {
			/* This is a new thread */
			put.insert = {
				id: text.thread, from: text.from, to: text.to,
				title: text.title, starttime: storageUtils.timetoString(text.time), 
				endtime: storageUtils.timetoString(text.time), length: 1, tags: text.tags,
				/*mentions: text.mentions*/
			};
		} else {
			/* For existing threads update endTime, length and perhaps title */
			put.update = [
				['endtime', 'set', storageUtils.timetoString(text.time)],
				['length', 'incr', 1]
			];
			
			if(text.title) put.update.push(['title', 'set', text.title]);
		}
		puts.push(put);
	}
	return puts;
};


exports.edit = function (edit) {
	var puts = [], put = makePut("update", 'texts');
	put.filters.push(['id', 'eq', edit.ref]);
	put.update = [];
	addTags(edit);
	if (edit.text) {
		put.update.push(['text', 'set', edit.text]);
	}
	/*
	if (edit.title) {
		
	}*/
	
	if (edit.tags) {
		put.update.push(['tags', 'set', edit.tags]); 
	}
	
	puts.push(put);
	return puts;
};

exports.room = exports.user = function (action) {
	
	var entity = action[action.type],
		isNewEntity = !(entity.old && entity.old.id),
		put = makePut(isNewEntity ? 'insert' : 'update', 'entities');
	if (isNewEntity) { // new room or user.
		put.insert = {
			id: entity.id, type: action.type, 
			description: entity.description,
			picture: entity.picture, 
			createtime: entity.createTime,
			identities: entity.identities.map(function(ident) { 
				return ident.split(':', 2); 
			}),
			timezone: entity.timezone, locale: entity.locale,
			params: entity.params,
			guides: entity.guides,
			deletetime: entity.deleteTime
		};
	} else { // update
		put.filters.push(['id', 'eq', entity.id]);
		put.update.push(['']);
	}
	
	return [put];
};

exports.join = exports.part = exports.admit = exports.expel = function (/*action*/) {
	
};



function addTags(action) {
	if (!action.tags) action.tags = [];
	for (var i in action.labels) if (action.labels[i] > 0.5) action.tags.push(i);
}