package com.artkezai.common.util;

import org.junit.jupiter.api.Test;

import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;

class CsvUtilTest {

	@Test
	void quotesEveryCellAndEscapesEmbeddedQuotes() {
		assertThat(CsvUtil.row(Arrays.asList("a", "say \"hi\"", 12, null)))
				.isEqualTo("\"a\",\"say \"\"hi\"\"\",\"12\",\"\"\r\n");
	}

	@Test
	void neutralisesSpreadsheetFormulas() {
		assertThat(CsvUtil.cell("=HYPERLINK(\"x\")")).isEqualTo("\"'=HYPERLINK(\"\"x\"\")\"");
		assertThat(CsvUtil.cell("+1")).isEqualTo("\"'+1\"");
		assertThat(CsvUtil.cell("@SUM")).isEqualTo("\"'@SUM\"");
	}

	@Test
	void keepsCommasAndNewlinesInsideTheQuotedCell() {
		assertThat(CsvUtil.cell("1 Road, Paris\nFrance")).isEqualTo("\"1 Road, Paris\nFrance\"");
	}
}
