import io
import docx


def extract_text_from_docx(file_bytes: bytes) -> str:
    """
    Extracts text from DOCX bytes preserving natural document reading order.
    Iterates through body elements (paragraphs and tables) in exact sequence.
    Excludes header and footer text elements to prevent repeated noise.
    """
    try:
        doc = docx.Document(io.BytesIO(file_bytes))
        text_lines = []

        # Iterate sequentially through document body elements
        for element in doc.element.body:
            # Paragraph element
            if element.tag.endswith('p'):
                p = docx.text.paragraph.Paragraph(element, doc)
                if p.text and p.text.strip():
                    text_lines.append(p.text.strip())
            # Table element
            elif element.tag.endswith('tbl'):
                t = docx.table.Table(element, doc)
                for row in t.rows:
                    row_cells = [cell.text.strip().replace("\n", " ") for cell in row.cells if cell.text and cell.text.strip()]
                    # Deduplicate adjacent identical cell text (from merged cells)
                    clean_row_cells = []
                    for c in row_cells:
                        if not clean_row_cells or clean_row_cells[-1] != c:
                            clean_row_cells.append(c)
                    if clean_row_cells:
                        text_lines.append(" | ".join(clean_row_cells))

        return "\n".join(text_lines)
    except Exception as e:
        raise ValueError(f"Failed to extract text from DOCX: {str(e)}")
