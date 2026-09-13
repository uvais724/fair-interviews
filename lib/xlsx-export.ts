type CellValue = string | number | boolean | null | undefined

type CellStyle =
  | "title"
  | "section"
  | "label"
  | "value"
  | "tableHeader"
  | "tableCell"
  | "number"
  | "verdictSection"
  | "verdictLabel"
  | "verdictValue"
  | "verdictSelect"
  | "verdictComments"
  | "muted"
  | string

type Cell = {
  value: CellValue
  style?: CellStyle
}

type Row = Array<CellValue | Cell>

export type Worksheet = {
  name: string
  rows: Row[]
  columns?: number[]
  merges?: string[]
}

type ZipEntry = {
  path: string
  content: Uint8Array
  crc32: number
  offset: number
}

const textEncoder = new TextEncoder()
const crcTable = makeCrcTable()

function makeCrcTable() {
  const table = new Uint32Array(256)

  for (let index = 0; index < table.length; index++) {
    let value = index

    for (let bit = 0; bit < 8; bit++) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
    }

    table[index] = value >>> 0
  }

  return table
}

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff

  for (const byte of bytes) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }

  return (crc ^ 0xffffffff) >>> 0
}

function xmlEscape(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}

function columnName(index: number) {
  let column = ""
  let value = index + 1

  while (value > 0) {
    const remainder = (value - 1) % 26
    column = String.fromCharCode(65 + remainder) + column
    value = Math.floor((value - 1) / 26)
  }

  return column
}

const styleIds: Record<CellStyle, number> = {
  title: 2,
  section: 5,
  label: 6,
  value: 7,
  tableHeader: 8,
  tableCell: 10,
  number: 9,
  verdictSection: 11,
  verdictLabel: 12,
  verdictValue: 13,
  verdictSelect: 15,
  verdictComments: 16,
  muted: 17,
}

function normalizeCell(cell: CellValue | Cell): Cell {
  if (cell && typeof cell === "object" && "value" in cell) {
    return cell
  }

  return { value: cell }
}

function cellXml(cell: CellValue | Cell, rowIndex: number, columnIndex: number) {
  const normalizedCell = normalizeCell(cell)
  const ref = `${columnName(columnIndex)}${rowIndex + 1}`
  const text = normalizedCell.value == null ? "" : String(normalizedCell.value)
  const style = normalizedCell.style ? ` s="${styleIds[normalizedCell.style]}"` : ""

  return `<c r="${ref}"${style} t="inlineStr"><is><t>${xmlEscape(text)}</t></is></c>`
}

function columnsXml(columns?: number[]) {
  if (!columns?.length) {
    return ""
  }

  const columnXml = columns
    .map(
      (width, index) =>
        `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`
    )
    .join("")

  return `<cols>${columnXml}</cols>`
}

function mergesXml(merges?: string[]) {
  if (!merges?.length) {
    return ""
  }

  return `<mergeCells count="${merges.length}">${merges
    .map((merge) => `<mergeCell ref="${merge}"/>`)
    .join("")}</mergeCells>`
}

function worksheetXml(sheet: Worksheet) {
  const rowXml = sheet.rows
    .map(
      (row, rowIndex) =>
        `<row r="${rowIndex + 1}" ht="${rowIndex === 0 ? 28 : 22}" customHeight="1">${row
          .map((cell, columnIndex) => cellXml(cell, rowIndex, columnIndex))
          .join("")}</row>`
    )
    .join("")

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  ${columnsXml(sheet.columns)}
  <sheetData>${rowXml}</sheetData>
  ${mergesXml(sheet.merges)}
</worksheet>`
}

function workbookXml(sheets: Worksheet[]) {
  const sheetXml = sheets
    .map(
      (sheet, index) =>
        `<sheet name="${xmlEscape(sheet.name)}" sheetId="${index + 1}" r:id="rId${
          index + 1
        }"/>`
    )
    .join("")

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>${sheetXml}</sheets>
</workbook>`
}

function workbookRelationshipsXml(sheets: Worksheet[]) {
  const sheetRelationships = sheets
    .map(
      (_sheet, index) =>
        `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${
          index + 1
        }.xml"/>`
    )
    .join("")
  const stylesRelationship = `<Relationship Id="rId${
    sheets.length + 1
  }" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>`

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${sheetRelationships}
  ${stylesRelationship}
</Relationships>`
}

function contentTypesXml(sheets: Worksheet[]) {
  const worksheetOverrides = sheets
    .map(
      (_sheet, index) =>
        `<Override PartName="/xl/worksheets/sheet${
          index + 1
        }.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
    )
    .join("")

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  ${worksheetOverrides}
</Types>`
}

function stylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="11">
    <font><sz val="10"/><name val="Arial"/><family val="2"/><charset val="1"/></font>
    <font><sz val="10"/><name val="Arial"/><family val="0"/></font>
    <font><sz val="10"/><name val="Arial"/><family val="0"/></font>
    <font><sz val="10"/><name val="Arial"/><family val="0"/></font>
    <font><b/><sz val="18"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="0"/><charset val="1"/></font>
    <font><b/><sz val="10"/><name val="Arial"/><family val="2"/><charset val="1"/></font>
    <font><b/><sz val="12"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="0"/><charset val="1"/></font>
    <font><b/><sz val="11"/><color rgb="FF111827"/><name val="Calibri"/><family val="0"/><charset val="1"/></font>
    <font><b/><sz val="12"/><color rgb="FF000000"/><name val="Calibri"/><family val="0"/><charset val="1"/></font>
    <font><sz val="10"/><color rgb="FF000000"/><name val="Arial"/><family val="2"/><charset val="1"/></font>
    <font><b/><sz val="12"/><color rgb="FF158466"/><name val="Calibri"/><family val="0"/><charset val="1"/></font>
  </fonts>
  <fills count="6">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF1F2937"/><bgColor rgb="FF111827"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF729FCF"/><bgColor rgb="FF969696"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFE5E7EB"/><bgColor rgb="FFD1D5DB"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF9FAFB"/><bgColor rgb="FFFFFFFF"/></patternFill></fill>
  </fills>
  <borders count="3">
    <border diagonalUp="false" diagonalDown="false"><left/><right/><top/><bottom/><diagonal/></border>
    <border diagonalUp="false" diagonalDown="false"><left style="thin"><color rgb="FFD1D5DB"/></left><right style="thin"><color rgb="FFD1D5DB"/></right><top style="thin"><color rgb="FFD1D5DB"/></top><bottom style="thin"><color rgb="FFD1D5DB"/></bottom><diagonal/></border>
    <border diagonalUp="false" diagonalDown="false"><left style="thin"/><right style="thin"/><top style="thin"/><bottom style="thin"/><diagonal/></border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="18">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="bottom"/></xf>
    <xf numFmtId="0" fontId="4" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="5" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <xf numFmtId="0" fontId="5" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <xf numFmtId="0" fontId="6" fillId="3" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="7" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="5" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="6" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="5" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="5" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="6" fillId="3" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="8" fillId="0" borderId="2" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="8" fillId="0" borderId="2" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="9" fillId="0" borderId="2" xfId="0" applyFont="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="10" fillId="0" borderId="2" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="8" fillId="0" borderId="2" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="8" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
  </cellXfs>
</styleSheet>`
}

function rootRelationshipsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
}

function encodeUtf8(value: string) {
  return textEncoder.encode(value)
}

function uint16(value: number) {
  const bytes = new Uint8Array(2)
  const view = new DataView(bytes.buffer)
  view.setUint16(0, value, true)

  return bytes
}

function uint32(value: number) {
  const bytes = new Uint8Array(4)
  const view = new DataView(bytes.buffer)
  view.setUint32(0, value, true)

  return bytes
}

function concat(chunks: Uint8Array[]) {
  const length = chunks.reduce((total, chunk) => total + chunk.byteLength, 0)
  const output = new Uint8Array(length)
  let offset = 0

  for (const chunk of chunks) {
    output.set(chunk, offset)
    offset += chunk.byteLength
  }

  return output
}

function localFileHeader(entry: ZipEntry) {
  const fileName = encodeUtf8(entry.path)

  return concat([
    uint32(0x04034b50),
    uint16(20),
    uint16(0),
    uint16(0),
    uint16(0),
    uint16(0),
    uint32(entry.crc32),
    uint32(entry.content.byteLength),
    uint32(entry.content.byteLength),
    uint16(fileName.byteLength),
    uint16(0),
    fileName,
  ])
}

function centralDirectoryHeader(entry: ZipEntry) {
  const fileName = encodeUtf8(entry.path)

  return concat([
    uint32(0x02014b50),
    uint16(20),
    uint16(20),
    uint16(0),
    uint16(0),
    uint16(0),
    uint16(0),
    uint32(entry.crc32),
    uint32(entry.content.byteLength),
    uint32(entry.content.byteLength),
    uint16(fileName.byteLength),
    uint16(0),
    uint16(0),
    uint16(0),
    uint16(0),
    uint32(0),
    uint32(entry.offset),
    fileName,
  ])
}

function endOfCentralDirectory(entryCount: number, directorySize: number, directoryOffset: number) {
  return concat([
    uint32(0x06054b50),
    uint16(0),
    uint16(0),
    uint16(entryCount),
    uint16(entryCount),
    uint32(directorySize),
    uint32(directoryOffset),
    uint16(0),
  ])
}

function zipFiles(files: { path: string; content: string }[]) {
  const chunks: Uint8Array[] = []
  const entries: ZipEntry[] = []
  let offset = 0

  for (const file of files) {
    const content = encodeUtf8(file.content)
    const entry = {
      path: file.path,
      content,
      crc32: crc32(content),
      offset,
    }
    const header = localFileHeader(entry)

    chunks.push(header, content)
    entries.push(entry)
    offset += header.byteLength + content.byteLength
  }

  const directoryOffset = offset
  const directoryChunks = entries.map(centralDirectoryHeader)
  const directory = concat(directoryChunks)
  const end = endOfCentralDirectory(entries.length, directory.byteLength, directoryOffset)

  return concat([...chunks, directory, end])
}

export function createXlsxWorkbook(sheets: Worksheet[]) {
  const files = [
    { path: "[Content_Types].xml", content: contentTypesXml(sheets) },
    { path: "_rels/.rels", content: rootRelationshipsXml() },
    { path: "xl/workbook.xml", content: workbookXml(sheets) },
    { path: "xl/_rels/workbook.xml.rels", content: workbookRelationshipsXml(sheets) },
    { path: "xl/styles.xml", content: stylesXml() },
    ...sheets.map((sheet, index) => ({
      path: `xl/worksheets/sheet${index + 1}.xml`,
      content: worksheetXml(sheet),
    })),
  ]

  return zipFiles(files)
}
