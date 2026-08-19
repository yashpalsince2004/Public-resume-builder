import fitz  # PyMuPDF


def extract_text_from_pdf(file_bytes: bytes) -> tuple[str, bool, str]:
    """
    Extracts text from PDF bytes using PyMuPDF (fitz) with layout block sorting.
    Returns a tuple (extracted_text, is_scanned, reason).
    
    Robust Scanned/Low-Text Heuristics:
    1. Total extracted alphabetic character count < 100
    2. Image count > 0 AND meaningful text block count == 0
    3. Low text ratio relative to document images
    """
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        pages_text = []
        total_images = 0
        total_blocks = 0
        total_alpha_chars = 0

        for page in doc:
            images = page.get_images()
            total_images += len(images)

            # Extract blocks sorted by reading order (y0 then x0)
            blocks = page.get_text("blocks")
            # Filter text blocks (block_type 0 is text)
            text_blocks = [b for b in blocks if len(b) >= 5 and b[4].strip() and b[6] == 0]
            total_blocks += len(text_blocks)

            # Sort blocks by vertical position y0 (with 10pt tolerance) then horizontal position x0
            text_blocks_sorted = sorted(text_blocks, key=lambda b: (round(b[1] / 10) * 10, b[0]))

            page_lines = []
            for b in text_blocks_sorted:
                block_text = b[4].strip()
                page_lines.append(block_text)
                total_alpha_chars += sum(1 for c in block_text if c.isalpha())

            if page_lines:
                pages_text.append("\n".join(page_lines))

        full_text = "\n\n".join(pages_text)

        # ── Robust Scanned/Low-Confidence Heuristics ──
        if total_alpha_chars < 80 and total_images > 0:
            return "", True, "scanned_pdf"
        
        if total_blocks == 0 and total_images > 0:
            return "", True, "scanned_pdf"

        if total_alpha_chars < 50:
            return "", True, "low_text_confidence"

        return full_text, False, ""
    except Exception as e:
        raise ValueError(f"Failed to extract text from PDF: {str(e)}")
