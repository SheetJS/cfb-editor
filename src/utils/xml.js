var xlmlregex = /<(\/?)([^\s?>!/:]*:|)([^\s?>:/]+)[^>]*>/mg;
export default function formatXml(xml) {
	var indent = 0, last = "";
	var formatted = xml.replace(xlmlregex, function($$, $1, $2, $3) {
		var old = indent;
		if($1 == "/") { --indent; --old; }
		else if($$.charAt($$.length - 2) == "/");
		else ++indent;
		var pad = ($3 == last && $1 == "/") ? "" : "\n" + "  ".repeat(old);
		last = $3;
		return pad + $$;
	});
  return formatted.replace(/\n+\n</mg, "\n<");
}
