/*
 * lib/output-uncollapsed.js: emits StackSets in uncollapsed format
 */

var mod_assert = require('assert');

/*
 * Arguments:
 *
 *    stacks	StackSet		Stacks to visualize
 *
 *    output	WritableStream		Output file
 */
exports.emit = function emitUncollapsed(args, callback)
{
	mod_assert.ok(args.stacks && args.stacks.constructor &&
	    args.stacks.constructor.name == 'StackSet',
	    'required "stacks" argument must be a StackSet');
	mod_assert.ok(args.output && args.output.write &&
	    typeof (args.output.write) == 'function',
	    'required "output" argument must be a function');

	args.stacks.eachStack(function (frames, count) {
		args.output.write(frames.join(';') + ' ' + count + '\n');
	});
	callback();
};
