//console.log(process.argv);

var arg = process.argv
var sum = 0;
for (var i = 2; i < arg.length; i++) {
	sum += +arg[i];
}

console.log(sum);
