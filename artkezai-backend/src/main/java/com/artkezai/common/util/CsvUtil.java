package com.artkezai.common.util;

import java.util.List;
import java.util.stream.Collectors;

public final class CsvUtil {

	private CsvUtil() {
	}

	public static String row(List<?> values) {
		return values.stream().map(CsvUtil::cell).collect(Collectors.joining(",")) + "\r\n";
	}

	// Quotes every cell and doubles embedded quotes (RFC 4180). A leading
	// = + - @ tab or CR is prefixed with ' so spreadsheet apps treat
	// user-supplied text (names, addresses, messages) as text, not a formula.
	static String cell(Object value) {
		if (value == null) {
			return "\"\"";
		}
		String text = value.toString();
		if (!text.isEmpty() && "=+-@\t\r".indexOf(text.charAt(0)) >= 0) {
			text = "'" + text;
		}
		return "\"" + text.replace("\"", "\"\"") + "\"";
	}
}
